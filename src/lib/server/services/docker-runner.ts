import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { Data, Effect, Layer, ServiceMap } from 'effect';
import { env } from '$env/dynamic/private';
import type { RunIntent, SubmissionRunResponse, SubmissionTestResult } from '$lib/types';
import type { ChallengeDefinition } from '../challenges/types';

const RUN_TIMEOUT_MS = 12_000;
const IMAGE_PREP_TIMEOUT_MS = 120_000;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const MAX_RUNS_PER_WINDOW = 20;
const MAX_CONCURRENT_RUNS = 2;
const MAX_LOG_BYTES = 64 * 1024;
const DEFAULT_IMAGE =
	'python:3.12-slim-bookworm@sha256:4a8e0824201e50fc44ee8d208a2b3e44f33e00448907e524066fca5a96eb5567';
const DOCKER_UNAVAILABLE_MESSAGE =
	'Docker is not running or not reachable. Start Docker and confirm `docker version` works, then try again.';
const IMAGE_PREP_TIMEOUT_MESSAGE =
	'Preparing the Python runner image took too long. Run `docker pull python:3.12-slim-bookworm` once, then try again.';

const preparedImages = new Map<string, Promise<void>>();

export class DockerRunnerError extends Data.TaggedError('DockerRunnerError')<{
	readonly message: string;
	readonly kind: string;
	readonly traceId: string;
	readonly timestamp: number;
	readonly command: string;
	readonly cause?: unknown;
}> {}

export class RunnerBusyError extends Data.TaggedError('RunnerBusyError')<{
	readonly message: string;
	readonly kind: string;
	readonly traceId: string;
	readonly timestamp: number;
}> {}

export class RunnerRateLimitError extends Data.TaggedError('RunnerRateLimitError')<{
	readonly message: string;
	readonly kind: string;
	readonly traceId: string;
	readonly timestamp: number;
}> {}

type RunSubmissionInput = {
	challenge: ChallengeDefinition;
	code: string;
	clientIp: string;
	intent: RunIntent;
	stdin?: string;
};

type FinalRunResult = Omit<SubmissionRunResponse, 'submissionId'>;

interface DockerRunnerDef {
	runSubmission: (
		input: RunSubmissionInput
	) => Effect.Effect<FinalRunResult, DockerRunnerError | RunnerBusyError | RunnerRateLimitError>;
}

type HarnessTestResult = SubmissionTestResult;

type HarnessOutput = {
	status: FinalRunResult['status'];
	durationMs: number;
	stdout: string;
	stderr: string;
	tests: HarnessTestResult[];
};

const PYTHON_HARNESS = String.raw`
import json
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path

MAX_LOG_BYTES = 64 * 1024
CASE_TIMEOUT = 3
WORKDIR = Path("/workspace")
STUDENT_FILE = WORKDIR / "main.py"
TEST_FILE = WORKDIR / "main_test.py"

FUNCTION_CASE_RUNNER = r"""
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path.cwd()))

module = __import__("main")
function_name = os.environ["KK_FUNCTION_NAME"]

if not hasattr(module, function_name):
    raise AttributeError(f"Expected function '{function_name}' was not found")

target = getattr(module, function_name)
case = json.loads(os.environ["KK_CASE_JSON"])
result = target(*case["args"])

with open(os.environ["KK_RESULT_FILE"], "w", encoding="utf-8") as handle:
    json.dump({"result": result}, handle)
"""

def normalize_output(value: str) -> str:
    return value.replace("\r\n", "\n").replace("\r", "\n")

def trim_to_limit(stdout: str, stderr: str) -> tuple[str, str]:
    stdout = normalize_output(stdout)
    stderr = normalize_output(stderr)

    encoded_stdout = stdout.encode("utf-8")
    encoded_stderr = stderr.encode("utf-8")

    if len(encoded_stdout) + len(encoded_stderr) <= MAX_LOG_BYTES:
        return stdout, stderr

    reserve = min(len(encoded_stderr), MAX_LOG_BYTES // 2)
    stdout_budget = MAX_LOG_BYTES - reserve

    stdout_trimmed = encoded_stdout[:stdout_budget].decode("utf-8", errors="ignore")
    stderr_trimmed = encoded_stderr[:reserve].decode("utf-8", errors="ignore")

    return stdout_trimmed, stderr_trimmed

def join_logs(existing_stdout: str, existing_stderr: str, new_stdout: str, new_stderr: str) -> tuple[str, str]:
    return trim_to_limit(existing_stdout + new_stdout, existing_stderr + new_stderr)

def hidden_message() -> str:
    return "Wrong answer"

def public_message(expected, actual) -> str:
    return f"Expected {expected!r}, got {actual!r}"

def run_function_case(function_name: str, case: dict) -> tuple[dict, str, str]:
    with tempfile.NamedTemporaryFile("w+", encoding="utf-8", delete=False) as handle:
        result_path = handle.name

    env = {
        "KK_FUNCTION_NAME": function_name,
        "KK_CASE_JSON": json.dumps({"args": case["args"]}),
        "KK_RESULT_FILE": result_path,
        "PYTHONDONTWRITEBYTECODE": "1",
    }

    proc = subprocess.run(
        [sys.executable, "-c", FUNCTION_CASE_RUNNER],
        cwd=str(WORKDIR),
        env=env,
        capture_output=True,
        text=True,
        timeout=CASE_TIMEOUT,
    )

    stdout, stderr = proc.stdout, proc.stderr

    if proc.returncode != 0:
        return {"kind": "error", "message": stderr.strip() or "Execution failed"}, stdout, stderr

    try:
        with open(result_path, "r", encoding="utf-8") as handle:
            data = json.load(handle)
    except Exception as exc:
        return {"kind": "error", "message": f"Could not read function result: {exc}"}, stdout, stderr
    finally:
        try:
            os.remove(result_path)
        except FileNotFoundError:
            pass

    actual = data.get("result")
    if actual == case["expected"]:
        return {"kind": "passed"}, stdout, stderr

    return {"kind": "failed", "message": public_message(case["expected"], actual)}, stdout, stderr

def run_stdin_case(case: dict) -> tuple[dict, str, str]:
    proc = subprocess.run(
        [sys.executable, str(STUDENT_FILE)],
        cwd=str(WORKDIR),
        input=case["stdin"],
        capture_output=True,
        text=True,
        timeout=CASE_TIMEOUT,
    )

    stdout = normalize_output(proc.stdout)
    stderr = normalize_output(proc.stderr)

    if proc.returncode != 0:
        return {"kind": "error", "message": stderr.strip() or "Program exited with a non-zero status"}, stdout, stderr

    actual = normalize_output(stdout)
    expected = normalize_output(case["expectedStdout"])

    if actual == expected:
        return {"kind": "passed"}, stdout, stderr

    return {"kind": "failed", "message": public_message(expected, actual)}, stdout, stderr

def run_visible_tests() -> tuple[str, str, int]:
    proc = subprocess.run(
        [sys.executable, "-m", "unittest", "-q", str(TEST_FILE.name)],
        cwd=str(WORKDIR),
        capture_output=True,
        text=True,
        timeout=CASE_TIMEOUT,
    )

    return normalize_output(proc.stdout), normalize_output(proc.stderr), proc.returncode

def run_sample_stdin(stdin: str) -> tuple[str, str, int]:
    proc = subprocess.run(
        [sys.executable, str(STUDENT_FILE)],
        cwd=str(WORKDIR),
        input=stdin,
        capture_output=True,
        text=True,
        timeout=CASE_TIMEOUT,
    )

    return normalize_output(proc.stdout), normalize_output(proc.stderr), proc.returncode

def main() -> None:
    started = time.perf_counter()
    payload = json.load(sys.stdin)

    intent = payload["intent"]
    tests = payload["tests"]
    mode = payload["mode"]
    function_name = payload.get("functionName")

    if intent == "run":
        if mode == "function":
            stdout, stderr, exit_code = run_visible_tests()
            status = "passed" if exit_code == 0 else "failed"
        else:
            stdout, stderr, exit_code = run_sample_stdin(payload.get("stdin", ""))
            status = "error" if exit_code != 0 else "passed"

        duration_ms = int((time.perf_counter() - started) * 1000)
        stdout, stderr = trim_to_limit(stdout, stderr)

        print(
            json.dumps(
                {
                    "status": status,
                    "durationMs": duration_ms,
                    "stdout": stdout,
                    "stderr": stderr,
                    "tests": [],
                }
            )
        )
        return

    collected_stdout = ""
    collected_stderr = ""
    test_results: list[dict] = []
    final_status = "passed"

    for case in tests:
        try:
            if mode == "function":
                outcome, case_stdout, case_stderr = run_function_case(function_name, case)
            else:
                outcome, case_stdout, case_stderr = run_stdin_case(case)
        except subprocess.TimeoutExpired:
            final_status = "timeout"
            test_results.append(
                {
                    "name": case["name"],
                    "visibility": case["visibility"],
                    "status": "error",
                    "message": "Execution timed out",
                }
            )
            collected_stdout, collected_stderr = join_logs(collected_stdout, collected_stderr, "", "Execution timed out\n")
            break
        except Exception as exc:
            final_status = "error"
            test_results.append(
                {
                    "name": case["name"],
                    "visibility": case["visibility"],
                    "status": "error",
                    "message": "Runner failed while grading this case",
                }
            )
            collected_stdout, collected_stderr = join_logs(collected_stdout, collected_stderr, "", f"{exc}\n")
            break

        collected_stdout, collected_stderr = join_logs(
            collected_stdout, collected_stderr, case_stdout, case_stderr
        )

        if outcome["kind"] == "passed":
            test_results.append(
                {
                    "name": case["name"],
                    "visibility": case["visibility"],
                    "status": "passed",
                }
            )
            continue

        if outcome["kind"] == "failed":
            final_status = "failed"
            test_results.append(
                {
                    "name": case["name"],
                    "visibility": case["visibility"],
                    "status": "failed",
                    "message": hidden_message() if case["visibility"] == "hidden" else outcome["message"],
                }
            )
            break

        final_status = "error"
        test_results.append(
            {
                "name": case["name"],
                "visibility": case["visibility"],
                "status": "error",
                "message": "Runtime error" if case["visibility"] == "hidden" else outcome["message"],
            }
        )
        break

    duration_ms = int((time.perf_counter() - started) * 1000)
    stdout, stderr = trim_to_limit(collected_stdout, collected_stderr)

    print(
        json.dumps(
            {
                "status": final_status,
                "durationMs": duration_ms,
                "stdout": stdout,
                "stderr": stderr,
                "tests": test_results,
            }
        )
    )

if __name__ == "__main__":
    main()
`;

const normalizeOutput = (value: string) => value.replaceAll('\r\n', '\n').replaceAll('\r', '\n');

const createTrace = () => ({
	traceId: randomUUID(),
	timestamp: Date.now()
});

const toCasePayload = ({
	challenge,
	intent,
	stdin
}: {
	challenge: ChallengeDefinition;
	intent: RunIntent;
	stdin?: string;
}) => {
	if (challenge.mode === 'function') {
		return {
			intent,
			mode: challenge.mode,
			functionName: challenge.functionName,
			stdin: stdin ?? '',
			tests: [
				...challenge.publicCases.map((test) => ({ ...test, visibility: 'public' as const })),
				...challenge.hiddenCases.map((test) => ({ ...test, visibility: 'hidden' as const }))
			]
		};
	}

	return {
		intent,
		mode: challenge.mode,
		stdin: stdin ?? '',
		tests: [
			...challenge.publicCases.map((test) => ({ ...test, visibility: 'public' as const })),
			...challenge.hiddenCases.map((test) => ({ ...test, visibility: 'hidden' as const }))
		]
	};
};

const writeRunnerFiles = async (runDir: string, challenge: ChallengeDefinition, code: string) => {
	const manifest = {
		slug: challenge.slug,
		mode: challenge.mode,
		functionName: challenge.mode === 'function' ? challenge.functionName : undefined
	};

	await Promise.all([
		writeFile(path.join(runDir, 'main.py'), code, 'utf8'),
		writeFile(
			path.join(runDir, 'challenge_manifest.json'),
			JSON.stringify(manifest, null, 2),
			'utf8'
		),
		writeFile(path.join(runDir, 'run_harness.py'), PYTHON_HARNESS, 'utf8'),
		challenge.mode === 'function' && challenge.testFileContent
			? writeFile(
					path.join(runDir, challenge.testFileName ?? 'main_test.py'),
					challenge.testFileContent,
					'utf8'
				)
			: Promise.resolve()
	]);
};

const runDockerCommand = async ({
	args,
	timeoutMs,
	stdin
}: {
	args: string[];
	timeoutMs: number;
	stdin?: string;
}) =>
	await new Promise<{
		stdout: string;
		stderr: string;
		timedOut: boolean;
		exitCode: number | null;
	}>((resolve, reject) => {
		const child = spawn('docker', args, {
			stdio: ['pipe', 'pipe', 'pipe']
		});

		let stdout = '';
		let stderr = '';
		let timedOut = false;

		const timer = setTimeout(() => {
			timedOut = true;
			child.kill('SIGKILL');
		}, timeoutMs);

		child.stdout.setEncoding('utf8');
		child.stderr.setEncoding('utf8');

		child.stdout.on('data', (chunk: string) => {
			stdout = (stdout + chunk).slice(-MAX_LOG_BYTES);
		});

		child.stderr.on('data', (chunk: string) => {
			stderr = (stderr + chunk).slice(-MAX_LOG_BYTES);
		});

		child.on('error', (cause) => {
			clearTimeout(timer);
			reject(cause);
		});

		child.on('close', (exitCode) => {
			clearTimeout(timer);
			resolve({
				stdout,
				stderr,
				timedOut,
				exitCode
			});
		});

		if (stdin) {
			child.stdin.write(stdin);
		}
		child.stdin.end();
	});

const ensureRunnerImageReady = async (image: string) => {
	const inFlight = preparedImages.get(image);
	if (inFlight) {
		await inFlight;
		return;
	}

	const preparation = (async () => {
		const inspectResult = await runDockerCommand({
			args: ['image', 'inspect', image],
			timeoutMs: 10_000
		});

		if (inspectResult.exitCode === 0) return;

		const pullResult = await runDockerCommand({
			args: ['pull', image],
			timeoutMs: IMAGE_PREP_TIMEOUT_MS
		});

		if (pullResult.timedOut) {
			throw new Error(IMAGE_PREP_TIMEOUT_MESSAGE);
		}

		if (pullResult.exitCode !== 0) {
			const stderr = normalizeOutput(pullResult.stderr);
			if (isDockerUnavailableMessage(stderr)) {
				throw new Error(DOCKER_UNAVAILABLE_MESSAGE);
			}

			throw new Error(stderr || `Failed to pull Docker image ${image}`);
		}
	})();

	preparedImages.set(image, preparation);

	try {
		await preparation;
	} catch (error) {
		preparedImages.delete(image);
		throw error;
	}
};

const runDockerHarness = async (runDir: string, payload: ReturnType<typeof toCasePayload>) => {
	const image = env.PYTHON_RUNNER_IMAGE || DEFAULT_IMAGE;
	await ensureRunnerImageReady(image);

	const args = [
		'run',
		'--rm',
		'--pull=never',
		'--interactive',
		'--network=none',
		'--read-only',
		'--cap-drop=ALL',
		'--security-opt=no-new-privileges',
		'--memory=128m',
		'--cpus=0.5',
		'--pids-limit=64',
		'--tmpfs',
		'/tmp:rw,noexec,nosuid,size=64m',
		'--tmpfs',
		'/home/python:rw,noexec,nosuid,size=16m',
		'--user',
		'1000:1000',
		'--workdir',
		'/workspace',
		'--env',
		'HOME=/home/python',
		'--env',
		'PYTHONDONTWRITEBYTECODE=1',
		'--volume',
		`${runDir}:/workspace`,
		image,
		'python',
		'/workspace/run_harness.py'
	];

	return await runDockerCommand({
		args,
		timeoutMs: RUN_TIMEOUT_MS,
		stdin: JSON.stringify(payload)
	});
};

const getDockerCauseMessage = (cause: unknown): string | undefined => {
	if (cause instanceof Error) return cause.message;
	if (typeof cause === 'string') return cause;
	return undefined;
};

const isDockerUnavailableMessage = (message: string | undefined) => {
	if (!message) return false;

	const normalized = message.toLowerCase();
	return (
		normalized.includes('docker.sock') ||
		normalized.includes('cannot connect to the docker daemon') ||
		normalized.includes('failed to connect to the docker api') ||
		normalized.includes('is the docker daemon running') ||
		normalized.includes('connect: no such file or directory')
	);
};

const formatDockerFailureMessage = (cause: unknown) => {
	if (cause instanceof Error && 'code' in cause && cause.code === 'ENOENT') {
		return DOCKER_UNAVAILABLE_MESSAGE;
	}

	const causeMessage = getDockerCauseMessage(cause);
	if (isDockerUnavailableMessage(causeMessage)) {
		return DOCKER_UNAVAILABLE_MESSAGE;
	}

	return causeMessage || 'Failed to run Docker sandbox';
};

export class DockerRunnerService extends ServiceMap.Service<DockerRunnerService, DockerRunnerDef>()(
	'DockerRunnerService'
) {
	static readonly layer = Layer.sync(DockerRunnerService, () => {
		const runHistory = new Map<string, number[]>();
		let activeRuns = 0;

		const acquireSlot = (clientIp: string) =>
			Effect.sync(() => {
				const now = Date.now();
				const existingRuns = runHistory.get(clientIp) ?? [];
				const recentRuns = existingRuns.filter(
					(timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
				);

				runHistory.set(clientIp, recentRuns);

				if (recentRuns.length >= MAX_RUNS_PER_WINDOW) {
					const trace = createTrace();
					throw new RunnerRateLimitError({
						message: 'runner_rate_limited',
						kind: 'runner_rate_limited',
						...trace
					});
				}

				if (activeRuns >= MAX_CONCURRENT_RUNS) {
					const trace = createTrace();
					throw new RunnerBusyError({
						message: 'runner_busy',
						kind: 'runner_busy',
						...trace
					});
				}

				recentRuns.push(now);
				runHistory.set(clientIp, recentRuns);
				activeRuns += 1;
			});

		const releaseSlot = () =>
			Effect.sync(() => {
				activeRuns = Math.max(0, activeRuns - 1);
			});

		const runSubmission = ({ challenge, code, clientIp, intent, stdin }: RunSubmissionInput) =>
			Effect.acquireUseRelease(
				acquireSlot(clientIp),
				() =>
					Effect.tryPromise({
						try: async () => {
							const runDir = await mkdtemp(path.join(tmpdir(), 'kk-runner-'));
							const startedAt = Date.now();

							try {
								await writeRunnerFiles(runDir, challenge, code);
								const harnessPayload = toCasePayload({ challenge, intent, stdin });
								const result = await runDockerHarness(runDir, harnessPayload);

								if (result.timedOut) {
									return {
										status: 'timeout',
										durationMs: Date.now() - startedAt,
										stdout: '',
										stderr: 'Execution timed out before the runner completed.',
										tests: []
									} satisfies FinalRunResult;
								}

								if (result.exitCode !== 0) {
									const dockerFailureMessage = isDockerUnavailableMessage(result.stderr)
										? DOCKER_UNAVAILABLE_MESSAGE
										: normalizeOutput(result.stderr || 'Docker exited with a non-zero status.');

									return {
										status: 'runner_error',
										durationMs: Date.now() - startedAt,
										stdout: '',
										stderr: dockerFailureMessage,
										tests: []
									} satisfies FinalRunResult;
								}

								const parsed = JSON.parse(result.stdout) as HarnessOutput;
								return {
									status: parsed.status,
									durationMs: parsed.durationMs,
									stdout: normalizeOutput(parsed.stdout),
									stderr: normalizeOutput(parsed.stderr),
									tests: parsed.tests
								} satisfies FinalRunResult;
							} finally {
								await rm(runDir, { recursive: true, force: true });
							}
						},
						catch: (cause) => {
							const trace = createTrace();
							return new DockerRunnerError({
								message: formatDockerFailureMessage(cause),
								kind: 'docker_runner_error',
								command: 'docker run',
								cause,
								...trace
							});
						}
					}),
				releaseSlot
			);

		return {
			runSubmission
		};
	});
}

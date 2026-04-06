import { randomUUID } from 'node:crypto';
import { Effect, Layer, ServiceMap } from 'effect';
import type { LessonRunResponse } from '$lib/types';
import {
	createDockerSubmissionRunner,
	DockerRunnerError,
	RunnerBusyError,
	RunnerRateLimitError
} from './docker-runner';
import { isLessonRunResponse, type RunSubmissionInput } from './runner-contract';

interface LessonRunnerDef {
	runSubmission: (
		input: RunSubmissionInput
	) => Effect.Effect<LessonRunResponse, DockerRunnerError | RunnerBusyError | RunnerRateLimitError>;
}

type PublicRunnerError = {
	message?: unknown;
	kind?: unknown;
	timestamp?: unknown;
	traceId?: unknown;
};

const REMOTE_RUNNER_TIMEOUT_MS = 15_000;

const createTrace = () => ({
	traceId: randomUUID(),
	timestamp: Date.now()
});

const isPublicRunnerError = (value: unknown): value is PublicRunnerError =>
	typeof value === 'object' && value !== null;

const createRemoteRunnerError = ({
	message,
	kind,
	command,
	cause,
	traceId,
	timestamp
}: {
	message: string;
	kind: string;
	command: string;
	cause?: unknown;
	traceId?: string;
	timestamp?: number;
}) =>
	new DockerRunnerError({
		message,
		kind,
		command,
		cause,
		traceId: traceId ?? randomUUID(),
		timestamp: timestamp ?? Date.now()
	});

const toRemoteRunnerFailure = ({
	status,
	payload,
	command
}: {
	status: number;
	payload: unknown;
	command: string;
}) => {
	const trace = createTrace();

	if (isPublicRunnerError(payload)) {
		const message =
			typeof payload.message === 'string' ? payload.message : `Runner request failed (${status})`;
		const kind = typeof payload.kind === 'string' ? payload.kind : 'runner_http_error';
		const traceId = typeof payload.traceId === 'string' ? payload.traceId : trace.traceId;
		const timestamp = typeof payload.timestamp === 'number' ? payload.timestamp : trace.timestamp;

		if (status === 429 && kind === 'runner_busy') {
			return new RunnerBusyError({ message, kind, traceId, timestamp });
		}

		if (status === 429 && kind === 'runner_rate_limited') {
			return new RunnerRateLimitError({ message, kind, traceId, timestamp });
		}

		return createRemoteRunnerError({
			message,
			kind,
			command,
			traceId,
			timestamp,
			cause: payload
		});
	}

	return createRemoteRunnerError({
		message: `Runner request failed (${status})`,
		kind: 'runner_http_error',
		command,
		cause: payload
	});
};

const parseRemoteRunnerResponse = async (response: Response) => {
	const payload = await response.json().catch(() => null);

	if (response.ok) {
		if (isLessonRunResponse(payload)) {
			return payload;
		}

		throw createRemoteRunnerError({
			message: 'Runner returned an invalid response payload',
			kind: 'runner_invalid_response',
			command: 'remote runner'
		});
	}

	throw toRemoteRunnerFailure({
		status: response.status,
		payload,
		command: 'remote runner'
	});
};

export class LessonRunnerService extends ServiceMap.Service<LessonRunnerService, LessonRunnerDef>()(
	'LessonRunnerService'
) {
	static readonly layer = Layer.sync(LessonRunnerService, () => {
		const localRunner = createDockerSubmissionRunner();

		const runSubmission = (input: RunSubmissionInput) =>
			Effect.tryPromise({
				try: async () => {
					const runnerApiUrl = process.env.RUNNER_API_URL?.trim();

					if (!runnerApiUrl) {
						return await localRunner.runSubmission(input);
					}

					const controller = new AbortController();
					const timeout = setTimeout(() => controller.abort(), REMOTE_RUNNER_TIMEOUT_MS);

					try {
						const response = await fetch(new URL('/run', runnerApiUrl), {
							method: 'POST',
							headers: {
								'content-type': 'application/json',
								...(process.env.RUNNER_API_KEY?.trim()
									? { authorization: `Bearer ${process.env.RUNNER_API_KEY.trim()}` }
									: {})
							},
							body: JSON.stringify(input),
							signal: controller.signal
						});

						return await parseRemoteRunnerResponse(response);
					} finally {
						clearTimeout(timeout);
					}
				},
				catch: (cause) => {
					if (
						cause instanceof DockerRunnerError ||
						cause instanceof RunnerBusyError ||
						cause instanceof RunnerRateLimitError
					) {
						return cause;
					}

					if (cause instanceof DOMException && cause.name === 'AbortError') {
						return createRemoteRunnerError({
							message: 'Remote runner request timed out',
							kind: 'runner_request_timeout',
							command: 'remote runner',
							cause
						});
					}

					return createRemoteRunnerError({
						message: cause instanceof Error ? cause.message : 'Remote runner request failed',
						kind: 'runner_request_error',
						command: 'remote runner',
						cause
					});
				}
			});

		return {
			runSubmission
		};
	});
}

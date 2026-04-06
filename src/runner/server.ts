import { randomUUID } from 'node:crypto';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import {
	createDockerSubmissionRunner,
	DockerRunnerError,
	RunnerBusyError,
	RunnerRateLimitError
} from '../lib/server/services/docker-runner';
import { isRunSubmissionInput } from '../lib/server/services/runner-contract';

const runner = createDockerSubmissionRunner();
const host = process.env.RUNNER_SERVER_HOST?.trim() || '0.0.0.0';
const port = Number(process.env.RUNNER_SERVER_PORT ?? '3001');
const runnerApiKey = process.env.RUNNER_API_KEY?.trim();

const createTrace = () => ({
	traceId: randomUUID(),
	timestamp: Date.now()
});

const writeJson = (response: ServerResponse, status: number, body: unknown) => {
	response.writeHead(status, {
		'content-type': 'application/json'
	});
	response.end(JSON.stringify(body));
};

const toPublicError = (
	error:
		| DockerRunnerError
		| RunnerBusyError
		| RunnerRateLimitError
		| { message: string; kind: string; traceId: string; timestamp: number }
) => ({
	message: error.message,
	kind: error.kind,
	traceId: error.traceId,
	timestamp: error.timestamp
});

const isAuthorized = (request: IncomingMessage) => {
	if (!runnerApiKey) {
		return true;
	}

	return request.headers.authorization === `Bearer ${runnerApiKey}`;
};

const readJsonBody = async (request: IncomingMessage) => {
	const chunks: Buffer[] = [];

	for await (const chunk of request) {
		chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
	}

	if (chunks.length === 0) {
		return null;
	}

	return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
};

const requestPathname = (request: IncomingMessage) =>
	new URL(request.url ?? '/', `http://${request.headers.host ?? `${host}:${port}`}`).pathname;

const server = createServer(async (request, response) => {
	const pathname = requestPathname(request);

	if (request.method === 'GET' && pathname === '/health') {
		writeJson(response, 200, { ok: true });
		return;
	}

	if (request.method !== 'POST' || pathname !== '/run') {
		writeJson(response, 404, { message: 'Not found' });
		return;
	}

	if (!isAuthorized(request)) {
		writeJson(response, 401, {
			message: 'Unauthorized runner request',
			kind: 'runner_unauthorized',
			...createTrace()
		});
		return;
	}

	const payload = await readJsonBody(request).catch(() => null);
	if (!isRunSubmissionInput(payload)) {
		writeJson(response, 400, {
			message: 'Invalid runner request body',
			kind: 'invalid_runner_request_body',
			...createTrace()
		});
		return;
	}

	try {
		const result = await runner.runSubmission(payload);
		writeJson(response, 200, result);
	} catch (error) {
		if (error instanceof RunnerBusyError) {
			writeJson(response, 429, toPublicError(error));
			return;
		}

		if (error instanceof RunnerRateLimitError) {
			writeJson(response, 429, toPublicError(error));
			return;
		}

		if (error instanceof DockerRunnerError) {
			writeJson(response, 500, toPublicError(error));
			return;
		}

		writeJson(response, 500, {
			message: error instanceof Error ? error.message : 'Unknown runner error',
			kind: 'runner_unknown_error',
			...createTrace()
		});
	}
});

server.listen(port, host, () => {
	console.log(`kk runner listening on http://${host}:${port}`);
});

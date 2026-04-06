import { error, json } from '@sveltejs/kit';
import { Effect } from 'effect';
import { api } from '../../../../convex/_generated/api';
import { effectRunner } from '$lib/runtime';
import { getChallenge } from '$lib/server/challenges';
import { DockerRunnerService } from '$lib/server/services/docker-runner';
import { ConvexPrivateService } from '$lib/services/convex';
import type { RunIntent } from '$lib/types';

const getClientIp = (requestEvent: { request: Request; getClientAddress: () => string }) => {
	const forwardedFor = requestEvent.request.headers.get('x-forwarded-for');

	if (forwardedFor) {
		return forwardedFor.split(',')[0]?.trim() || 'unknown';
	}

	return requestEvent.getClientAddress();
};

export const POST = async (event) => {
	const payload = await event.request.json().catch(() => {
		error(400, {
			message: 'Invalid JSON body',
			kind: 'invalid_request_body',
			timestamp: Date.now()
		});
	});

	if (!payload || typeof payload !== 'object') {
		error(400, {
			message: 'Request body must be an object',
			kind: 'invalid_request_body',
			timestamp: Date.now()
		});
	}

	const challengeSlug =
		'challengeSlug' in payload && typeof payload.challengeSlug === 'string'
			? payload.challengeSlug.trim()
			: '';
	const code = 'code' in payload && typeof payload.code === 'string' ? payload.code : '';
	const intent: RunIntent = 'intent' in payload && payload.intent === 'run' ? 'run' : 'submit';
	const stdin = 'stdin' in payload && typeof payload.stdin === 'string' ? payload.stdin : undefined;

	if (!challengeSlug || !code.trim()) {
		error(400, {
			message: 'challengeSlug and code are required',
			kind: 'invalid_submission_payload',
			timestamp: Date.now()
		});
	}

	const challenge = getChallenge(challengeSlug);

	if (!challenge) {
		error(404, {
			message: 'Challenge not found',
			kind: 'challenge_not_found',
			timestamp: Date.now()
		});
	}

	const clientIp = getClientIp(event);

	const submissionEffect = Effect.gen(function* () {
		const runner = yield* DockerRunnerService;

		const runResult = yield* runner.runSubmission({
			challenge,
			code,
			clientIp,
			intent,
			stdin: intent === 'run' && challenge.mode === 'stdin' ? stdin : undefined
		});

		if (intent === 'run') {
			return runResult;
		}

		const convex = yield* ConvexPrivateService;

		const submissionId = yield* convex.mutation({
			func: api.private.submissions.createPending,
			args: {
				challengeSlug: challenge.slug,
				code,
				mode: challenge.mode,
				createdAt: Date.now()
			}
		});

		yield* convex.mutation({
			func: api.private.submissions.finalize,
			args: {
				id: submissionId,
				status: runResult.status,
				stdout: runResult.stdout,
				stderr: runResult.stderr,
				tests: runResult.tests,
				durationMs: runResult.durationMs
			}
		});

		return {
			submissionId,
			...runResult
		};
	});

	const submission = await effectRunner(submissionEffect);

	return json(submission);
};

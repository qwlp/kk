import { error, json } from '@sveltejs/kit';
import { Effect } from 'effect';
import { effectRunner } from '$lib/runtime';
import { getLessonDefinition } from '$lib/server/course';
import { DockerRunnerService } from '$lib/server/services/docker-runner';

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

	const lessonSlug =
		'lessonSlug' in payload && typeof payload.lessonSlug === 'string'
			? payload.lessonSlug.trim()
			: '';
	const code = 'code' in payload && typeof payload.code === 'string' ? payload.code : '';

	if (!lessonSlug || !code.trim()) {
		error(400, {
			message: 'lessonSlug and code are required',
			kind: 'invalid_lesson_run_payload',
			timestamp: Date.now()
		});
	}

	const lesson = getLessonDefinition(lessonSlug);

	if (!lesson) {
		error(404, {
			message: 'Lesson not found',
			kind: 'lesson_not_found',
			timestamp: Date.now()
		});
	}

	if (lesson.mode === 'quiz') {
		error(400, {
			message: 'Quiz lessons cannot be run',
			kind: 'quiz_run_not_supported',
			timestamp: Date.now()
		});
	}

	const clientIp = getClientIp(event);

	const runEffect = Effect.gen(function* () {
		const runner = yield* DockerRunnerService;

		return yield* runner.runSubmission({
			lesson,
			code,
			clientIp,
			intent: 'run',
			stdin:
				lesson.mode === 'console'
					? (lesson.sampleInput ?? lesson.publicCases[0]?.stdin ?? '')
					: undefined
		});
	});

	const runResult = await effectRunner(runEffect);

	return json(runResult);
};

import { error, json } from '@sveltejs/kit';
import { Effect } from 'effect';
import { createGenericError, effectRunner } from '$lib/runtime';
import { getPublishedLessonEvaluator } from '$lib/server/course';
import { LessonRunnerService } from '$lib/server/services/lesson-runner';
import {
	isPublishedCodingLessonEvaluator,
	toRunnerLessonDefinition
} from '$lib/server/services/runner-contract';

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

	const runEffect = Effect.gen(function* () {
		const lesson = yield* getPublishedLessonEvaluator({ lessonSlug });

		if (!isPublishedCodingLessonEvaluator(lesson)) {
			return yield* Effect.fail(
				createGenericError({
					message: 'Quiz lessons cannot be run',
					status: 400,
					kind: 'quiz_run_not_supported'
				})
			);
		}

		const clientIp = getClientIp(event);
		const runner = yield* LessonRunnerService;

		return yield* runner.runSubmission({
			lesson: toRunnerLessonDefinition(lesson),
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

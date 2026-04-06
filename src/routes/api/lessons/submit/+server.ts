import { error, json } from '@sveltejs/kit';
import { Effect } from 'effect';
import { api } from '../../../../convex/_generated/api';
import { effectRunner } from '$lib/runtime';
import { getLessonDefinition } from '$lib/server/course';
import { DockerRunnerService } from '$lib/server/services/docker-runner';
import { ConvexPrivateService } from '$lib/services/convex';
import type { LessonSubmitResponse } from '$lib/types';

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
	const selectedChoiceId =
		'selectedChoiceId' in payload && typeof payload.selectedChoiceId === 'string'
			? payload.selectedChoiceId
			: undefined;

	if (!lessonSlug) {
		error(400, {
			message: 'lessonSlug is required',
			kind: 'invalid_lesson_submit_payload',
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

	if (lesson.mode !== 'quiz' && !code.trim()) {
		error(400, {
			message: 'code is required for coding lessons',
			kind: 'invalid_lesson_submit_payload',
			timestamp: Date.now()
		});
	}

	if (lesson.mode === 'quiz' && !selectedChoiceId) {
		error(400, {
			message: 'selectedChoiceId is required for quiz lessons',
			kind: 'invalid_quiz_submit_payload',
			timestamp: Date.now()
		});
	}

	const clientIp = getClientIp(event);

	const submissionEffect = Effect.gen(function* () {
		const createdAt = Date.now();

		let result: LessonSubmitResponse;

		if (lesson.mode === 'quiz') {
			result = {
				status: selectedChoiceId === lesson.correctChoiceId ? 'passed' : 'failed',
				durationMs: 0,
				stdout: '',
				stderr: '',
				tests: [],
				selectedChoiceId
			};
		} else {
			const runner = yield* DockerRunnerService;
			const runResult = yield* runner.runSubmission({
				lesson,
				code,
				clientIp,
				intent: 'submit',
				stdin: lesson.mode === 'console' ? lesson.sampleInput : undefined
			});

			result = runResult;
		}

		const convex = yield* ConvexPrivateService;
		const submissionId = yield* convex.mutation({
			func: api.private.submissions.createCompleted,
			args: {
				lessonSlug: lesson.slug,
				code: lesson.mode === 'quiz' ? '' : code,
				mode: lesson.mode,
				status: result.status,
				stdout: result.stdout ?? '',
				stderr: result.stderr ?? '',
				tests: result.tests ?? [],
				durationMs: result.durationMs,
				createdAt,
				selectedChoiceId
			}
		});

		return {
			...result,
			submissionId
		};
	});

	const submission = await effectRunner(submissionEffect);

	return json(submission);
};

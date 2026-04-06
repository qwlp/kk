import type { LessonRunResponse, RunIntent, SubmissionTestResult } from '$lib/types';
import type {
	IoCase,
	PublishedConsoleLessonEvaluator,
	PublishedUnitLessonEvaluator,
	UnitCase,
	PublishedLessonEvaluator
} from '$lib/server/course/types';

export interface RunnerConsoleLessonDefinition {
	slug: string;
	mode: 'console';
	publicCases: IoCase[];
	hiddenCases: IoCase[];
}

export interface RunnerUnitLessonDefinition {
	slug: string;
	mode: 'unit';
	functionName: string;
	testFileName: string;
	testFileContent: string;
	publicCases: UnitCase[];
	hiddenCases: UnitCase[];
}

export type RunnerLessonDefinition = RunnerConsoleLessonDefinition | RunnerUnitLessonDefinition;

export interface RunSubmissionInput {
	lesson: RunnerLessonDefinition;
	code: string;
	clientIp: string;
	intent: RunIntent;
	stdin?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const isIoCase = (value: unknown): value is IoCase =>
	isRecord(value) &&
	typeof value.name === 'string' &&
	typeof value.stdin === 'string' &&
	typeof value.expectedStdout === 'string';

const isUnitCase = (value: unknown): value is UnitCase =>
	isRecord(value) &&
	typeof value.name === 'string' &&
	Array.isArray(value.args) &&
	'expected' in value;

const isSubmissionTestResult = (value: unknown): value is SubmissionTestResult =>
	isRecord(value) &&
	typeof value.name === 'string' &&
	(value.status === 'passed' || value.status === 'failed' || value.status === 'error') &&
	(value.visibility === 'public' || value.visibility === 'hidden') &&
	(value.message === undefined || typeof value.message === 'string');

export const isRunnerLessonDefinition = (value: unknown): value is RunnerLessonDefinition => {
	if (!isRecord(value) || typeof value.slug !== 'string') {
		return false;
	}

	if (
		value.mode === 'console' &&
		Array.isArray(value.publicCases) &&
		Array.isArray(value.hiddenCases)
	) {
		return value.publicCases.every(isIoCase) && value.hiddenCases.every(isIoCase);
	}

	if (
		value.mode === 'unit' &&
		typeof value.functionName === 'string' &&
		typeof value.testFileName === 'string' &&
		typeof value.testFileContent === 'string' &&
		Array.isArray(value.publicCases) &&
		Array.isArray(value.hiddenCases)
	) {
		return value.publicCases.every(isUnitCase) && value.hiddenCases.every(isUnitCase);
	}

	return false;
};

export const isRunSubmissionInput = (value: unknown): value is RunSubmissionInput =>
	isRecord(value) &&
	isRunnerLessonDefinition(value.lesson) &&
	typeof value.code === 'string' &&
	typeof value.clientIp === 'string' &&
	(value.intent === 'run' || value.intent === 'submit') &&
	(value.stdin === undefined || typeof value.stdin === 'string');

export const isLessonRunResponse = (value: unknown): value is LessonRunResponse =>
	isRecord(value) &&
	(value.status === 'passed' ||
		value.status === 'failed' ||
		value.status === 'error' ||
		value.status === 'timeout' ||
		value.status === 'runner_error') &&
	typeof value.durationMs === 'number' &&
	typeof value.stdout === 'string' &&
	typeof value.stderr === 'string' &&
	Array.isArray(value.tests) &&
	value.tests.every(isSubmissionTestResult);

export const toRunnerLessonDefinition = (
	lesson: PublishedConsoleLessonEvaluator | PublishedUnitLessonEvaluator
): RunnerLessonDefinition => {
	if (lesson.mode === 'console') {
		return {
			slug: lesson.slug,
			mode: lesson.mode,
			publicCases: lesson.publicCases,
			hiddenCases: lesson.hiddenCases
		};
	}

	return {
		slug: lesson.slug,
		mode: lesson.mode,
		functionName: lesson.functionName,
		testFileName: lesson.testFileName,
		testFileContent: lesson.testFileContent,
		publicCases: lesson.publicCases,
		hiddenCases: lesson.hiddenCases
	};
};

export const isPublishedCodingLessonEvaluator = (
	lesson: PublishedLessonEvaluator
): lesson is PublishedConsoleLessonEvaluator | PublishedUnitLessonEvaluator =>
	lesson.mode === 'console' || lesson.mode === 'unit';

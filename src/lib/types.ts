export type LessonMode = 'console' | 'unit' | 'quiz';
export type RunIntent = 'run' | 'submit';

export type SubmissionStatus =
	| 'running'
	| 'passed'
	| 'failed'
	| 'error'
	| 'timeout'
	| 'runner_error';

export type TestResultStatus = 'passed' | 'failed' | 'error';
export type TestVisibility = 'public' | 'hidden';

export interface ChapterSummary {
	slug: string;
	order: number;
	title: string;
	description: string;
	lessonCount: number;
}

export interface LessonSummary {
	slug: string;
	chapterSlug: string;
	order: number;
	title: string;
	mode: LessonMode;
}

export interface CourseSequenceItem {
	slug: string;
	chapterSlug: string;
	title: string;
	order: number;
	globalOrder: number;
	mode: LessonMode;
}

export interface BasePublicLesson extends CourseSequenceItem {
	chapterTitle: string;
	prompt: string;
	lessonHtml: string;
}

export interface ConsoleLesson extends BasePublicLesson {
	mode: 'console';
	starterCode: string;
	solutionCode: string;
	sampleInput?: string;
}

export interface UnitLesson extends BasePublicLesson {
	mode: 'unit';
	starterCode: string;
	solutionCode: string;
	testFileName: string;
	testFileContent: string;
	functionName: string;
}

export interface QuizChoice {
	id: string;
	label: string;
	labelHtml: string;
}

export interface QuizLesson extends BasePublicLesson {
	mode: 'quiz';
	question: string;
	questionHtml: string;
	choices: QuizChoice[];
}

export type PublicLesson = ConsoleLesson | UnitLesson | QuizLesson;

export interface SubmissionTestResult {
	name: string;
	status: TestResultStatus;
	visibility: TestVisibility;
	message?: string;
}

export interface SubmissionRecord {
	id: string;
	lessonSlug: string;
	code: string;
	mode: LessonMode;
	status: SubmissionStatus;
	stdout: string;
	stderr: string;
	tests: SubmissionTestResult[];
	durationMs: number;
	createdAt: number;
	selectedChoiceId?: string;
}

export interface LessonRunResponse {
	status: Exclude<SubmissionStatus, 'running'>;
	durationMs: number;
	stdout: string;
	stderr: string;
	tests: SubmissionTestResult[];
}

export interface LessonSubmitResponse extends LessonRunResponse {
	submissionId?: string;
	selectedChoiceId?: string;
}

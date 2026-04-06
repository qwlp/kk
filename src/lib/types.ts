export type ChallengeMode = 'function' | 'stdin';
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

export interface PublicChallenge {
	slug: string;
	title: string;
	prompt: string;
	starterCode: string;
	solutionCode: string;
	lessonHtml: string;
	expectedOutput?: string;
	testFileName?: string;
	testFileContent?: string;
	mode: ChallengeMode;
}

export interface ChallengeSummary {
	slug: string;
	title: string;
	mode: ChallengeMode;
}

export interface SubmissionTestResult {
	name: string;
	status: TestResultStatus;
	visibility: TestVisibility;
	message?: string;
}

export interface SubmissionRecord {
	id: string;
	challengeSlug: string;
	code: string;
	mode: ChallengeMode;
	status: SubmissionStatus;
	stdout: string;
	stderr: string;
	tests: SubmissionTestResult[];
	durationMs: number;
	createdAt: number;
}

export interface SubmissionRunResponse {
	submissionId?: string;
	status: Exclude<SubmissionStatus, 'running'>;
	durationMs: number;
	stdout: string;
	stderr: string;
	tests: SubmissionTestResult[];
}

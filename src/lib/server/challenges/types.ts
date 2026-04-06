import type { ChallengeMode, PublicChallenge } from '$lib/types';

export interface TestCase {
	name: string;
	args: unknown[];
	expected: unknown;
}

export interface IoCase {
	name: string;
	stdin: string;
	expectedStdout: string;
}

export interface LessonMetadata {
	assetDir: string;
	testFileName?: string;
	testFileContent?: string;
}

interface BaseChallenge extends PublicChallenge, LessonMetadata {
	mode: ChallengeMode;
}

export interface FunctionChallenge extends BaseChallenge {
	mode: 'function';
	functionName: string;
	publicCases: TestCase[];
	hiddenCases: TestCase[];
}

export interface StdinChallenge extends BaseChallenge {
	mode: 'stdin';
	publicCases: IoCase[];
	hiddenCases: IoCase[];
}

export type ChallengeDefinition = FunctionChallenge | StdinChallenge;

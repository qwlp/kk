import type {
	ChapterSummary,
	ConsoleLesson,
	LessonMode,
	PublicLesson,
	QuizLesson,
	UnitLesson
} from '$lib/types';

export interface IoCase {
	name: string;
	stdin: string;
	expectedStdout: string;
}

export interface UnitCase {
	name: string;
	args: unknown[];
	expected: unknown;
}

interface LessonAssetMetadata {
	assetDir: string;
}

export interface ChapterDefinition extends ChapterSummary {
	lessons: LessonDefinition[];
}

export interface ConsoleLessonDefinition extends ConsoleLesson, LessonAssetMetadata {
	mode: 'console';
	publicCases: IoCase[];
	hiddenCases: IoCase[];
}

export interface UnitLessonDefinition extends UnitLesson, LessonAssetMetadata {
	mode: 'unit';
	publicCases: UnitCase[];
	hiddenCases: UnitCase[];
}

export interface QuizLessonDefinition extends QuizLesson, LessonAssetMetadata {
	mode: 'quiz';
	correctChoiceId: string;
}

export type LessonDefinition =
	| ConsoleLessonDefinition
	| UnitLessonDefinition
	| QuizLessonDefinition;

export interface ChapterManifest {
	slug: string;
	order: number;
	title: string;
	description: string;
}

interface LessonManifestBase {
	slug: string;
	order: number;
	title: string;
	prompt: string;
	mode: LessonMode;
}

interface QuizChoiceManifest {
	id: string;
	label: string;
}

export interface ConsoleLessonManifest extends LessonManifestBase {
	mode: 'console';
	publicCases: IoCase[];
	hiddenCases: IoCase[];
	sampleInput?: string;
}

export interface UnitLessonManifest extends LessonManifestBase {
	mode: 'unit';
	functionName: string;
	publicCases: UnitCase[];
	hiddenCases: UnitCase[];
}

export interface QuizLessonManifest extends LessonManifestBase {
	mode: 'quiz';
	question: string;
	choices: QuizChoiceManifest[];
	correctChoiceId: string;
}

export type LessonManifest = ConsoleLessonManifest | UnitLessonManifest | QuizLessonManifest;

export type AnyPublicLesson = PublicLesson;

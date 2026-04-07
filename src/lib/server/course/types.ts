import type {
	ChapterSummary,
	CourseSequenceItem,
	LessonMode,
	PublicLesson,
	QuizChoice
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

interface LessonDefinitionBase extends CourseSequenceItem {
	chapterTitle: string;
	prompt: string;
	lessonHtml: string;
}

export interface ChapterDefinition extends ChapterSummary {
	lessons: LessonDefinition[];
}

export interface ConsoleLessonDefinition extends LessonDefinitionBase, LessonAssetMetadata {
	mode: 'console';
	starterCode: string;
	solutionCode: string;
	sampleInput?: string;
	publicCases: IoCase[];
	hiddenCases: IoCase[];
}

export interface UnitLessonDefinition extends LessonDefinitionBase, LessonAssetMetadata {
	mode: 'unit';
	starterCode: string;
	solutionCode: string;
	testFileName: string;
	testFileContent: string;
	functionName: string;
	publicCases: UnitCase[];
	hiddenCases: UnitCase[];
}

export interface QuizLessonDefinition extends LessonDefinitionBase, LessonAssetMetadata {
	mode: 'quiz';
	question: string;
	questionHtml: string;
	choices: QuizChoice[];
	correctChoiceId: string;
}

export type LessonDefinition =
	| ConsoleLessonDefinition
	| UnitLessonDefinition
	| QuizLessonDefinition;

interface PublishedLessonRuntimeBase extends CourseSequenceItem {
	courseSlug: string;
	courseVersionNumber: number;
	lessonVersionId: string;
	chapterTitle: string;
	prompt: string;
	lessonHtml: string;
}

export interface PublishedConsoleLessonRuntime extends PublishedLessonRuntimeBase {
	mode: 'console';
	starterCode: string;
	sampleInput?: string;
}

export interface PublishedUnitLessonRuntime extends PublishedLessonRuntimeBase {
	mode: 'unit';
	starterCode: string;
	functionName: string;
	testFileName: string;
	testFileContent: string;
}

export interface PublishedQuizLessonRuntime extends PublishedLessonRuntimeBase {
	mode: 'quiz';
	question: string;
	questionHtml: string;
	choices: QuizChoice[];
}

export type PublishedLessonRuntime =
	| PublishedConsoleLessonRuntime
	| PublishedUnitLessonRuntime
	| PublishedQuizLessonRuntime;

interface PublishedLessonEvaluatorBase {
	courseSlug: string;
	chapterSlug: string;
	slug: string;
	mode: LessonMode;
	courseVersionNumber: number;
	lessonVersionId: string;
}

export interface PublishedConsoleLessonEvaluator extends PublishedLessonEvaluatorBase {
	mode: 'console';
	sampleInput?: string;
	publicCases: IoCase[];
	hiddenCases: IoCase[];
	solutionCode: string;
}

export interface PublishedUnitLessonEvaluator extends PublishedLessonEvaluatorBase {
	mode: 'unit';
	functionName: string;
	publicCases: UnitCase[];
	hiddenCases: UnitCase[];
	solutionCode: string;
	testFileName: string;
	testFileContent: string;
}

export interface PublishedQuizLessonEvaluator extends PublishedLessonEvaluatorBase {
	mode: 'quiz';
	correctChoiceId: string;
}

export type PublishedLessonEvaluator =
	| PublishedConsoleLessonEvaluator
	| PublishedUnitLessonEvaluator
	| PublishedQuizLessonEvaluator;

export interface PublishedCourseNavigation {
	courseSlug: string;
	courseVersionNumber: number;
	chapters: ChapterSummary[];
	sequence: CourseSequenceItem[];
}

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

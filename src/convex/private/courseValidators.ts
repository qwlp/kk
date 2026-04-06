import { v } from 'convex/values';

export const courseStatusValidator = v.union(v.literal('active'), v.literal('archived'));
export const courseDraftStatusValidator = v.union(
	v.literal('active'),
	v.literal('published'),
	v.literal('abandoned')
);
export const lessonModeValidator = v.union(
	v.literal('console'),
	v.literal('unit'),
	v.literal('quiz')
);

export const ioCaseValidator = v.object({
	name: v.string(),
	stdin: v.string(),
	expectedStdout: v.string()
});

export const unitCaseValidator = v.object({
	name: v.string(),
	args: v.array(v.any()),
	expected: v.any()
});

export const quizChoiceValidator = v.object({
	id: v.string(),
	label: v.string(),
	labelHtml: v.string()
});

export const chapterSummaryValidator = v.object({
	slug: v.string(),
	order: v.number(),
	title: v.string(),
	description: v.string(),
	lessonCount: v.number()
});

export const courseSequenceItemValidator = v.object({
	slug: v.string(),
	chapterSlug: v.string(),
	title: v.string(),
	order: v.number(),
	globalOrder: v.number(),
	mode: lessonModeValidator
});

export const draftLessonFieldsValidator = {
	chapterSlug: v.string(),
	slug: v.string(),
	order: v.number(),
	mode: lessonModeValidator,
	title: v.string(),
	prompt: v.string(),
	lessonMarkdown: v.string(),
	lessonHtml: v.string(),
	starterCode: v.optional(v.string()),
	sampleInput: v.optional(v.string()),
	questionMarkdown: v.optional(v.string()),
	questionHtml: v.optional(v.string()),
	choices: v.optional(v.array(quizChoiceValidator)),
	functionName: v.optional(v.string()),
	publicCases: v.optional(v.array(v.union(ioCaseValidator, unitCaseValidator))),
	hiddenCases: v.optional(v.array(v.union(ioCaseValidator, unitCaseValidator))),
	solutionCode: v.optional(v.string()),
	testFileName: v.optional(v.string()),
	testFileContent: v.optional(v.string()),
	correctChoiceId: v.optional(v.string())
};

export const importDraftChapterValidator = v.object({
	slug: v.string(),
	order: v.number(),
	title: v.string(),
	description: v.string()
});

export const importDraftLessonValidator = v.object(draftLessonFieldsValidator);

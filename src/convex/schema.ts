import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
	chapterSummaryValidator,
	courseDraftStatusValidator,
	courseSequenceItemValidator,
	courseStatusValidator,
	ioCaseValidator,
	lessonModeValidator,
	quizChoiceValidator,
	unitCaseValidator
} from './private/courseValidators';

const submissionTestValidator = v.object({
	name: v.string(),
	status: v.union(v.literal('passed'), v.literal('failed'), v.literal('error')),
	visibility: v.union(v.literal('public'), v.literal('hidden')),
	message: v.optional(v.string())
});

export default defineSchema({
	users: defineTable({
		tokenIdentifier: v.string(),
		subject: v.string(),
		issuer: v.string(),
		name: v.optional(v.string()),
		email: v.optional(v.string()),
		imageUrl: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number()
	}).index('by_tokenIdentifier', ['tokenIdentifier']),

	userCourseStates: defineTable({
		userId: v.id('users'),
		courseSlug: v.string(),
		completedLessonSlugs: v.array(v.string()),
		lastCompletedChapterSlug: v.optional(v.string()),
		lastCompletedLessonSlug: v.optional(v.string()),
		lastActiveChapterSlug: v.optional(v.string()),
		lastActiveLessonSlug: v.optional(v.string()),
		vimModeEnabled: v.optional(v.boolean()),
		lessonPaneRatio: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_userId', ['userId'])
		.index('by_userId_courseSlug', ['userId', 'courseSlug']),

	courses: defineTable({
		slug: v.string(),
		title: v.string(),
		description: v.string(),
		language: v.string(),
		status: courseStatusValidator,
		activeDraftId: v.optional(v.id('courseDrafts')),
		publishedVersionNumber: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_slug', ['slug'])
		.index('by_status', ['status']),

	courseDrafts: defineTable({
		courseId: v.id('courses'),
		draftNumber: v.number(),
		title: v.string(),
		description: v.string(),
		language: v.string(),
		status: courseDraftStatusValidator,
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_courseId_status', ['courseId', 'status'])
		.index('by_courseId_draftNumber', ['courseId', 'draftNumber']),

	draftChapters: defineTable({
		courseId: v.id('courses'),
		draftId: v.id('courseDrafts'),
		slug: v.string(),
		order: v.number(),
		title: v.string(),
		description: v.string(),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_draftId_order', ['draftId', 'order'])
		.index('by_draftId_slug', ['draftId', 'slug']),

	draftLessons: defineTable({
		courseId: v.id('courses'),
		draftId: v.id('courseDrafts'),
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
		correctChoiceId: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_draftId_chapterSlug_order', ['draftId', 'chapterSlug', 'order'])
		.index('by_draftId_slug', ['draftId', 'slug'])
		.index('by_draftId_chapterSlug_slug', ['draftId', 'chapterSlug', 'slug']),

	courseVersions: defineTable({
		courseId: v.id('courses'),
		versionNumber: v.number(),
		title: v.string(),
		description: v.string(),
		language: v.string(),
		publishedAt: v.number(),
		publishedFromDraftId: v.id('courseDrafts'),
		chapterCount: v.number(),
		lessonCount: v.number()
	})
		.index('by_courseId_versionNumber', ['courseId', 'versionNumber'])
		.index('by_courseId_publishedAt', ['courseId', 'publishedAt']),

	chapterVersions: defineTable({
		courseId: v.id('courses'),
		courseVersionNumber: v.number(),
		chapterSlug: v.string(),
		order: v.number(),
		title: v.string(),
		description: v.string(),
		lessonCount: v.number(),
		publishedAt: v.number()
	})
		.index('by_courseId_version_chapterSlug', ['courseId', 'courseVersionNumber', 'chapterSlug'])
		.index('by_courseId_version_order', ['courseId', 'courseVersionNumber', 'order']),

	lessonVersions: defineTable({
		courseId: v.id('courses'),
		courseVersionNumber: v.number(),
		chapterSlug: v.string(),
		lessonSlug: v.string(),
		order: v.number(),
		globalOrder: v.number(),
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
		publishedAt: v.number()
	})
		.index('by_courseId_version_chapterSlug_lessonSlug', [
			'courseId',
			'courseVersionNumber',
			'chapterSlug',
			'lessonSlug'
		])
		.index('by_courseId_version_globalOrder', ['courseId', 'courseVersionNumber', 'globalOrder'])
		.index('by_courseId_version_chapterSlug_order', [
			'courseId',
			'courseVersionNumber',
			'chapterSlug',
			'order'
		])
		.index('by_courseId_version_lessonSlug', ['courseId', 'courseVersionNumber', 'lessonSlug']),

	lessonEvaluatorVersions: defineTable({
		courseId: v.id('courses'),
		courseVersionNumber: v.number(),
		lessonSlug: v.string(),
		lessonVersionId: v.id('lessonVersions'),
		publicCases: v.optional(v.array(v.union(ioCaseValidator, unitCaseValidator))),
		hiddenCases: v.optional(v.array(v.union(ioCaseValidator, unitCaseValidator))),
		solutionCode: v.optional(v.string()),
		testFileName: v.optional(v.string()),
		testFileContent: v.optional(v.string()),
		correctChoiceId: v.optional(v.string()),
		publishedAt: v.number()
	})
		.index('by_lessonVersionId', ['lessonVersionId'])
		.index('by_courseId_version_lessonSlug', ['courseId', 'courseVersionNumber', 'lessonSlug']),

	courseVersionNavigation: defineTable({
		courseId: v.id('courses'),
		courseVersionNumber: v.number(),
		chapters: v.array(chapterSummaryValidator),
		sequence: v.array(courseSequenceItemValidator),
		publishedAt: v.number()
	}).index('by_courseId_version', ['courseId', 'courseVersionNumber']),

	submissions: defineTable({
		courseSlug: v.optional(v.string()),
		chapterSlug: v.optional(v.string()),
		lessonSlug: v.optional(v.string()),
		challengeSlug: v.optional(v.string()),
		courseVersionNumber: v.optional(v.number()),
		lessonVersionId: v.optional(v.id('lessonVersions')),
		code: v.string(),
		mode: v.union(
			v.literal('console'),
			v.literal('unit'),
			v.literal('quiz'),
			v.literal('stdin'),
			v.literal('function')
		),
		status: v.union(
			v.literal('running'),
			v.literal('passed'),
			v.literal('failed'),
			v.literal('error'),
			v.literal('timeout'),
			v.literal('runner_error')
		),
		stdout: v.string(),
		stderr: v.string(),
		tests: v.array(submissionTestValidator),
		durationMs: v.number(),
		createdAt: v.number(),
		selectedChoiceId: v.optional(v.string())
	})
});

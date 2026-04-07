/* eslint-disable @typescript-eslint/no-explicit-any */
import { v } from 'convex/values';
import { getCourseNavigation, getPublishedCourseContext } from './courseHelpers';
import { privateQuery } from './helpers';

const publicLessonBase = (
	lesson: {
		_id: unknown;
		chapterSlug: string;
		lessonSlug: string;
		order: number;
		globalOrder: number;
		title: string;
		prompt: string;
		lessonHtml: string;
		mode: 'console' | 'unit' | 'quiz';
		starterCode?: string;
		sampleInput?: string;
		questionHtml?: string;
		choices?: { id: string; label: string; labelHtml: string }[];
		functionName?: string;
	},
	chapterTitle: string,
	courseSlug: string,
	courseVersionNumber: number
) => ({
	courseSlug,
	courseVersionNumber,
	lessonVersionId: String(lesson._id),
	slug: lesson.lessonSlug,
	chapterSlug: lesson.chapterSlug,
	chapterTitle,
	order: lesson.order,
	globalOrder: lesson.globalOrder,
	title: lesson.title,
	prompt: lesson.prompt,
	lessonHtml: lesson.lessonHtml,
	mode: lesson.mode,
	starterCode: lesson.starterCode,
	sampleInput: lesson.sampleInput,
	questionHtml: lesson.questionHtml,
	choices: lesson.choices,
	functionName: lesson.functionName
});

export const getPublishedCourseBySlug = privateQuery({
	args: {
		courseSlug: v.string()
	},
	handler: async (ctx, args) => {
		const published = await getPublishedCourseContext(ctx.db, args.courseSlug);

		if (!published) {
			return null;
		}

		return {
			slug: published.course.slug,
			title: published.courseVersion.title,
			description: published.courseVersion.description,
			language: published.courseVersion.language,
			status: published.course.status,
			courseVersionNumber: published.courseVersion.versionNumber,
			publishedAt: published.courseVersion.publishedAt
		};
	}
});

export const getPublishedNavigation = privateQuery({
	args: {
		courseSlug: v.string()
	},
	handler: async (ctx, args) => {
		const published = await getPublishedCourseContext(ctx.db, args.courseSlug);

		if (!published) {
			return null;
		}

		const navigation = await getCourseNavigation(
			ctx.db,
			published.course._id,
			published.courseVersion.versionNumber
		);

		if (!navigation) {
			return null;
		}

		return {
			courseSlug: published.course.slug,
			courseVersionNumber: published.courseVersion.versionNumber,
			chapters: navigation.chapters,
			sequence: navigation.sequence
		};
	}
});

export const getPublishedLessonBySlugs = privateQuery({
	args: {
		courseSlug: v.string(),
		chapterSlug: v.string(),
		lessonSlug: v.string()
	},
	handler: async (ctx, args) => {
		const published = await getPublishedCourseContext(ctx.db, args.courseSlug);

		if (!published) {
			return null;
		}

		const [chapter, lesson] = await Promise.all([
			ctx.db
				.query('chapterVersions')
				.withIndex('by_courseId_version_chapterSlug', (q: any) =>
					q
						.eq('courseId', published.course._id)
						.eq('courseVersionNumber', published.courseVersion.versionNumber)
						.eq('chapterSlug', args.chapterSlug)
				)
				.unique(),
			ctx.db
				.query('lessonVersions')
				.withIndex('by_courseId_version_chapterSlug_lessonSlug', (q: any) =>
					q
						.eq('courseId', published.course._id)
						.eq('courseVersionNumber', published.courseVersion.versionNumber)
						.eq('chapterSlug', args.chapterSlug)
						.eq('lessonSlug', args.lessonSlug)
				)
				.unique()
		]);

		if (!chapter || !lesson) {
			return null;
		}

		if (lesson.mode === 'quiz') {
			return {
				...publicLessonBase(
					lesson,
					chapter.title,
					published.course.slug,
					published.courseVersion.versionNumber
				),
				question: lesson.questionMarkdown ?? '',
				questionHtml: lesson.questionHtml ?? '',
				choices: lesson.choices ?? []
			};
		}

		if (lesson.mode === 'console') {
			return {
				...publicLessonBase(
					lesson,
					chapter.title,
					published.course.slug,
					published.courseVersion.versionNumber
				),
				starterCode: lesson.starterCode ?? '',
				sampleInput: lesson.sampleInput
			};
		}

		const evaluator = await ctx.db
			.query('lessonEvaluatorVersions')
			.withIndex('by_lessonVersionId', (q: any) => q.eq('lessonVersionId', lesson._id))
			.unique();

		return {
			...publicLessonBase(
				lesson,
				chapter.title,
				published.course.slug,
				published.courseVersion.versionNumber
			),
			starterCode: lesson.starterCode ?? '',
			functionName: lesson.functionName ?? '',
			testFileName: evaluator?.testFileName ?? 'main_test.py',
			testFileContent: evaluator?.testFileContent ?? ''
		};
	}
});

export const getPublishedAdjacentLessons = privateQuery({
	args: {
		courseSlug: v.string(),
		chapterSlug: v.string(),
		lessonSlug: v.string()
	},
	handler: async (ctx, args) => {
		const published = await getPublishedCourseContext(ctx.db, args.courseSlug);

		if (!published) {
			return null;
		}

		const navigation = await getCourseNavigation(
			ctx.db,
			published.course._id,
			published.courseVersion.versionNumber
		);

		if (!navigation) {
			return null;
		}

		const currentIndex = navigation.sequence.findIndex(
			(item) => item.chapterSlug === args.chapterSlug && item.slug === args.lessonSlug
		);

		if (currentIndex < 0) {
			return null;
		}

		return {
			previousLesson: navigation.sequence[currentIndex - 1] ?? null,
			nextLesson: navigation.sequence[currentIndex + 1] ?? null
		};
	}
});

export const getPublishedLessonEvaluatorBySlug = privateQuery({
	args: {
		courseSlug: v.string(),
		lessonSlug: v.string()
	},
	handler: async (ctx, args) => {
		const published = await getPublishedCourseContext(ctx.db, args.courseSlug);

		if (!published) {
			return null;
		}

		const lesson = await ctx.db
			.query('lessonVersions')
			.withIndex('by_courseId_version_lessonSlug', (q: any) =>
				q
					.eq('courseId', published.course._id)
					.eq('courseVersionNumber', published.courseVersion.versionNumber)
					.eq('lessonSlug', args.lessonSlug)
			)
			.unique();

		if (!lesson) {
			return null;
		}

		const evaluator = await ctx.db
			.query('lessonEvaluatorVersions')
			.withIndex('by_lessonVersionId', (q: any) => q.eq('lessonVersionId', lesson._id))
			.unique();

		if (!evaluator) {
			return null;
		}

		if (lesson.mode === 'quiz') {
			return {
				courseSlug: published.course.slug,
				chapterSlug: lesson.chapterSlug,
				slug: lesson.lessonSlug,
				mode: lesson.mode,
				courseVersionNumber: published.courseVersion.versionNumber,
				lessonVersionId: String(lesson._id),
				correctChoiceId: evaluator.correctChoiceId ?? ''
			};
		}

		if (lesson.mode === 'console') {
			return {
				courseSlug: published.course.slug,
				chapterSlug: lesson.chapterSlug,
				slug: lesson.lessonSlug,
				mode: lesson.mode,
				courseVersionNumber: published.courseVersion.versionNumber,
				lessonVersionId: String(lesson._id),
				sampleInput: lesson.sampleInput,
				publicCases: evaluator.publicCases ?? [],
				hiddenCases: evaluator.hiddenCases ?? [],
				solutionCode: evaluator.solutionCode ?? ''
			};
		}

		return {
			courseSlug: published.course.slug,
			chapterSlug: lesson.chapterSlug,
			slug: lesson.lessonSlug,
			mode: lesson.mode,
			courseVersionNumber: published.courseVersion.versionNumber,
			lessonVersionId: String(lesson._id),
			functionName: lesson.functionName ?? '',
			publicCases: evaluator.publicCases ?? [],
			hiddenCases: evaluator.hiddenCases ?? [],
			solutionCode: evaluator.solutionCode ?? '',
			testFileName: evaluator.testFileName ?? '',
			testFileContent: evaluator.testFileContent ?? ''
		};
	}
});

/* eslint-disable @typescript-eslint/no-explicit-any */
import { v } from 'convex/values';
import type { Doc } from '../_generated/dataModel';
import {
	getActiveDraftContext,
	getNextDraftNumber,
	getPublishedCourseContext
} from './courseHelpers';
import { privateMutation } from './helpers';

const invariant = (condition: boolean, message: string) => {
	if (!condition) {
		throw new Error(message);
	}
};

const ensureContiguousOrders = (values: { order: number; slug: string }[], label: string) => {
	values.forEach((value, index) => {
		invariant(
			value.order === index + 1,
			`${label} order for ${value.slug} must be contiguous starting at 1`
		);
	});
};

const ensureUniqueSlugs = (values: { slug: string }[], label: string) => {
	const seen = new Set<string>();

	for (const value of values) {
		invariant(!seen.has(value.slug), `Duplicate ${label} slug: ${value.slug}`);
		seen.add(value.slug);
	}
};

const validateQuizLesson = (lesson: Doc<'draftLessons'>) => {
	invariant(
		typeof lesson.questionMarkdown === 'string',
		`Quiz lesson ${lesson.slug} is missing questionMarkdown`
	);
	invariant(
		typeof lesson.questionHtml === 'string',
		`Quiz lesson ${lesson.slug} is missing questionHtml`
	);
	invariant(
		Array.isArray(lesson.choices) && lesson.choices.length > 0,
		`Quiz lesson ${lesson.slug} is missing choices`
	);
	invariant(
		typeof lesson.correctChoiceId === 'string',
		`Quiz lesson ${lesson.slug} is missing correctChoiceId`
	);
	invariant(
		(lesson.choices ?? []).some((choice) => choice.id === lesson.correctChoiceId),
		`Quiz lesson ${lesson.slug} has an invalid correctChoiceId`
	);
	const choiceIds = new Set<string>();
	for (const choice of lesson.choices ?? []) {
		invariant(!choiceIds.has(choice.id), `Quiz lesson ${lesson.slug} has duplicate choice ids`);
		choiceIds.add(choice.id);
	}
};

const validateConsoleLesson = (lesson: Doc<'draftLessons'>) => {
	invariant(
		typeof lesson.starterCode === 'string',
		`Console lesson ${lesson.slug} is missing starterCode`
	);
	invariant(
		typeof lesson.solutionCode === 'string',
		`Console lesson ${lesson.slug} is missing solutionCode`
	);
	invariant(
		Array.isArray(lesson.publicCases),
		`Console lesson ${lesson.slug} is missing publicCases`
	);
	invariant(
		Array.isArray(lesson.hiddenCases),
		`Console lesson ${lesson.slug} is missing hiddenCases`
	);
};

const validateUnitLesson = (lesson: Doc<'draftLessons'>) => {
	invariant(
		typeof lesson.starterCode === 'string',
		`Unit lesson ${lesson.slug} is missing starterCode`
	);
	invariant(
		typeof lesson.solutionCode === 'string',
		`Unit lesson ${lesson.slug} is missing solutionCode`
	);
	invariant(
		typeof lesson.functionName === 'string',
		`Unit lesson ${lesson.slug} is missing functionName`
	);
	invariant(
		typeof lesson.testFileName === 'string',
		`Unit lesson ${lesson.slug} is missing testFileName`
	);
	invariant(
		typeof lesson.testFileContent === 'string',
		`Unit lesson ${lesson.slug} is missing testFileContent`
	);
	invariant(Array.isArray(lesson.publicCases), `Unit lesson ${lesson.slug} is missing publicCases`);
	invariant(Array.isArray(lesson.hiddenCases), `Unit lesson ${lesson.slug} is missing hiddenCases`);
};

const validateDraftForPublish = ({
	chapters,
	lessons
}: {
	chapters: Doc<'draftChapters'>[];
	lessons: Doc<'draftLessons'>[];
}) => {
	const sortedChapters = [...chapters].sort((left, right) => left.order - right.order);
	ensureUniqueSlugs(sortedChapters, 'chapter');
	ensureContiguousOrders(sortedChapters, 'Chapter');

	const chapterSlugSet = new Set(sortedChapters.map((chapter) => chapter.slug));
	ensureUniqueSlugs(lessons, 'lesson');

	for (const lesson of lessons) {
		invariant(
			chapterSlugSet.has(lesson.chapterSlug),
			`Lesson ${lesson.slug} references missing chapter ${lesson.chapterSlug}`
		);
		invariant(lesson.lessonHtml.trim().length > 0, `Lesson ${lesson.slug} is missing lessonHtml`);

		if (lesson.mode === 'quiz') {
			validateQuizLesson(lesson);
			continue;
		}

		if (lesson.mode === 'console') {
			validateConsoleLesson(lesson);
			continue;
		}

		validateUnitLesson(lesson);
	}

	for (const chapter of sortedChapters) {
		const chapterLessons = lessons
			.filter((lesson) => lesson.chapterSlug === chapter.slug)
			.sort((left, right) => left.order - right.order);

		ensureContiguousOrders(chapterLessons, `Lesson order in chapter ${chapter.slug}`);
	}

	return sortedChapters;
};

const toNavigationChapter = ({
	slug,
	order,
	title,
	description,
	lessonCount
}: {
	slug: string;
	order: number;
	title: string;
	description: string;
	lessonCount: number;
}) => ({
	slug,
	order,
	title,
	description,
	lessonCount
});

const toNavigationLesson = (lesson: Doc<'draftLessons'>, globalOrder: number) => ({
	slug: lesson.slug,
	chapterSlug: lesson.chapterSlug,
	title: lesson.title,
	order: lesson.order,
	globalOrder,
	mode: lesson.mode
});

export const publishDraft = privateMutation({
	args: {
		courseSlug: v.string()
	},
	handler: async (ctx, args) => {
		const draftContext = await getActiveDraftContext(ctx.db, args.courseSlug);

		if (!draftContext?.draft) {
			throw new Error(`Course ${args.courseSlug} does not have an active draft`);
		}

		const [chapters, lessons] = await Promise.all([
			ctx.db
				.query('draftChapters')
				.withIndex('by_draftId_order', (q: any) => q.eq('draftId', draftContext.draft!._id))
				.collect(),
			ctx.db
				.query('draftLessons')
				.withIndex('by_draftId_slug', (q: any) => q.eq('draftId', draftContext.draft!._id))
				.collect()
		]);

		const sortedChapters = validateDraftForPublish({ chapters, lessons });
		const publishedAt = Date.now();
		const versionNumber = (draftContext.course.publishedVersionNumber ?? 0) + 1;

		await ctx.db.insert('courseVersions', {
			courseId: draftContext.course._id,
			versionNumber,
			title: draftContext.draft.title,
			description: draftContext.draft.description,
			language: draftContext.draft.language,
			publishedAt,
			publishedFromDraftId: draftContext.draft._id,
			chapterCount: sortedChapters.length,
			lessonCount: lessons.length
		});

		const navigationChapters = [];
		const navigationSequence = [];
		let globalOrder = 1;

		for (const chapter of sortedChapters) {
			const chapterLessons = lessons
				.filter((lesson: Doc<'draftLessons'>) => lesson.chapterSlug === chapter.slug)
				.sort((left: Doc<'draftLessons'>, right: Doc<'draftLessons'>) => left.order - right.order);

			await ctx.db.insert('chapterVersions', {
				courseId: draftContext.course._id,
				courseVersionNumber: versionNumber,
				chapterSlug: chapter.slug,
				order: chapter.order,
				title: chapter.title,
				description: chapter.description,
				lessonCount: chapterLessons.length,
				publishedAt
			});

			navigationChapters.push(
				toNavigationChapter({
					slug: chapter.slug,
					order: chapter.order,
					title: chapter.title,
					description: chapter.description,
					lessonCount: chapterLessons.length
				})
			);

			for (const lesson of chapterLessons) {
				const lessonVersionId = await ctx.db.insert('lessonVersions', {
					courseId: draftContext.course._id,
					courseVersionNumber: versionNumber,
					chapterSlug: lesson.chapterSlug,
					lessonSlug: lesson.slug,
					order: lesson.order,
					globalOrder,
					mode: lesson.mode,
					title: lesson.title,
					prompt: lesson.prompt,
					lessonMarkdown: lesson.lessonMarkdown,
					lessonHtml: lesson.lessonHtml,
					starterCode: lesson.starterCode,
					sampleInput: lesson.sampleInput,
					questionMarkdown: lesson.questionMarkdown,
					questionHtml: lesson.questionHtml,
					choices: lesson.choices,
					functionName: lesson.functionName,
					publishedAt
				});

				await ctx.db.insert('lessonEvaluatorVersions', {
					courseId: draftContext.course._id,
					courseVersionNumber: versionNumber,
					lessonSlug: lesson.slug,
					lessonVersionId,
					publicCases: lesson.publicCases,
					hiddenCases: lesson.hiddenCases,
					solutionCode: lesson.solutionCode,
					testFileName: lesson.testFileName,
					testFileContent: lesson.testFileContent,
					correctChoiceId: lesson.correctChoiceId,
					publishedAt
				});

				navigationSequence.push(toNavigationLesson(lesson, globalOrder));
				globalOrder += 1;
			}
		}

		await ctx.db.insert('courseVersionNavigation', {
			courseId: draftContext.course._id,
			courseVersionNumber: versionNumber,
			chapters: navigationChapters,
			sequence: navigationSequence,
			publishedAt
		});

		await ctx.db.patch(draftContext.draft._id, {
			status: 'published',
			updatedAt: publishedAt
		});

		await ctx.db.patch(draftContext.course._id, {
			title: draftContext.draft.title,
			description: draftContext.draft.description,
			language: draftContext.draft.language,
			publishedVersionNumber: versionNumber,
			activeDraftId: undefined,
			updatedAt: publishedAt
		});

		return {
			courseSlug: draftContext.course.slug,
			courseVersionNumber: versionNumber,
			publishedAt
		};
	}
});

export const clonePublishedToDraft = privateMutation({
	args: {
		courseSlug: v.string()
	},
	handler: async (ctx, args) => {
		const activeDraftContext = await getActiveDraftContext(ctx.db, args.courseSlug);

		if (activeDraftContext?.draft) {
			return {
				draftId: activeDraftContext.draft._id,
				draftNumber: activeDraftContext.draft.draftNumber
			};
		}

		const published = await getPublishedCourseContext(ctx.db, args.courseSlug);

		if (!published) {
			throw new Error(`Course ${args.courseSlug} does not have a published version`);
		}

		const [chapters, lessons, evaluators] = await Promise.all([
			ctx.db
				.query('chapterVersions')
				.withIndex('by_courseId_version_order', (q: any) =>
					q
						.eq('courseId', published.course._id)
						.eq('courseVersionNumber', published.courseVersion.versionNumber)
				)
				.collect(),
			ctx.db
				.query('lessonVersions')
				.withIndex('by_courseId_version_globalOrder', (q: any) =>
					q
						.eq('courseId', published.course._id)
						.eq('courseVersionNumber', published.courseVersion.versionNumber)
				)
				.collect(),
			ctx.db
				.query('lessonEvaluatorVersions')
				.withIndex('by_courseId_version_lessonSlug', (q: any) =>
					q
						.eq('courseId', published.course._id)
						.eq('courseVersionNumber', published.courseVersion.versionNumber)
				)
				.collect()
		]);

		const evaluatorByLessonVersionId: Map<
			Doc<'lessonVersions'>['_id'],
			Doc<'lessonEvaluatorVersions'>
		> = new Map(
			evaluators.map(
				(evaluator: Doc<'lessonEvaluatorVersions'>) =>
					[evaluator.lessonVersionId, evaluator] as const
			)
		);
		const createdAt = Date.now();
		const draftNumber = await getNextDraftNumber(ctx.db, published.course._id);
		const draftId = await ctx.db.insert('courseDrafts', {
			courseId: published.course._id,
			draftNumber,
			title: published.courseVersion.title,
			description: published.courseVersion.description,
			language: published.courseVersion.language,
			status: 'active',
			createdAt,
			updatedAt: createdAt
		});

		for (const chapter of chapters) {
			await ctx.db.insert('draftChapters', {
				courseId: published.course._id,
				draftId,
				slug: chapter.chapterSlug,
				order: chapter.order,
				title: chapter.title,
				description: chapter.description,
				createdAt,
				updatedAt: createdAt
			});
		}

		for (const lesson of lessons) {
			const evaluator: Doc<'lessonEvaluatorVersions'> | undefined = evaluatorByLessonVersionId.get(
				lesson._id
			);

			await ctx.db.insert('draftLessons', {
				courseId: published.course._id,
				draftId,
				chapterSlug: lesson.chapterSlug,
				slug: lesson.lessonSlug,
				order: lesson.order,
				mode: lesson.mode,
				title: lesson.title,
				prompt: lesson.prompt,
				lessonMarkdown: lesson.lessonMarkdown,
				lessonHtml: lesson.lessonHtml,
				starterCode: lesson.starterCode,
				sampleInput: lesson.sampleInput,
				questionMarkdown: lesson.questionMarkdown,
				questionHtml: lesson.questionHtml,
				choices: lesson.choices,
				functionName: lesson.functionName,
				publicCases: evaluator?.publicCases,
				hiddenCases: evaluator?.hiddenCases,
				solutionCode: evaluator?.solutionCode,
				testFileName: evaluator?.testFileName,
				testFileContent: evaluator?.testFileContent,
				correctChoiceId: evaluator?.correctChoiceId,
				createdAt,
				updatedAt: createdAt
			});
		}

		await ctx.db.patch(published.course._id, {
			activeDraftId: draftId,
			updatedAt: createdAt
		});

		return {
			draftId,
			draftNumber
		};
	}
});

export const abandonDraft = privateMutation({
	args: {
		courseSlug: v.string()
	},
	handler: async (ctx, args) => {
		const draftContext = await getActiveDraftContext(ctx.db, args.courseSlug);

		if (!draftContext?.draft) {
			return null;
		}

		const now = Date.now();

		await ctx.db.patch(draftContext.draft._id, {
			status: 'abandoned',
			updatedAt: now
		});

		await ctx.db.patch(draftContext.course._id, {
			activeDraftId: undefined,
			updatedAt: now
		});

		return {
			draftId: draftContext.draft._id
		};
	}
});

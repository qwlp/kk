/* eslint-disable @typescript-eslint/no-explicit-any */
import { v } from 'convex/values';
import type { MutationCtx } from '../_generated/server';
import { getActiveDraftContext, getCourseBySlug, getNextDraftNumber } from './courseHelpers';
import { importDraftChapterValidator, importDraftLessonValidator } from './courseValidators';
import { privateMutation } from './helpers';

type MutationDbCtx = {
	db: MutationCtx['db'];
};

const ensureImportDraft = async ({
	ctx,
	courseSlug,
	title,
	description,
	language
}: {
	ctx: MutationDbCtx;
	courseSlug: string;
	title: string;
	description: string;
	language: string;
}) => {
	const now = Date.now();
	let course = await getCourseBySlug(ctx.db, courseSlug);

	if (!course) {
		const courseId = await ctx.db.insert('courses', {
			slug: courseSlug,
			title,
			description,
			language,
			status: 'active',
			createdAt: now,
			updatedAt: now
		});
		course = await ctx.db.get(courseId);
	}

	if (!course) {
		throw new Error(`Could not create course ${courseSlug}`);
	}

	if (course.activeDraftId) {
		const activeDraft = await ctx.db.get(course.activeDraftId);
		if (activeDraft?.status === 'active') {
			await ctx.db.patch(course._id, {
				title,
				description,
				language,
				updatedAt: now
			});
			await ctx.db.patch(activeDraft._id, {
				title,
				description,
				language,
				updatedAt: now
			});

			return {
				course: (await ctx.db.get(course._id)) ?? course,
				draft: (await ctx.db.get(activeDraft._id)) ?? activeDraft
			};
		}
	}

	const draftNumber = await getNextDraftNumber(ctx.db, course._id);
	const draftId = await ctx.db.insert('courseDrafts', {
		courseId: course._id,
		draftNumber,
		title,
		description,
		language,
		status: 'active',
		createdAt: now,
		updatedAt: now
	});

	await ctx.db.patch(course._id, {
		title,
		description,
		language,
		activeDraftId: draftId,
		updatedAt: now
	});

	return {
		course: (await ctx.db.get(course._id)) ?? course,
		draft: await ctx.db.get(draftId)
	};
};

export const clearImportedDraft = privateMutation({
	args: {
		courseSlug: v.string()
	},
	handler: async (ctx, args) => {
		const draftContext = await getActiveDraftContext(ctx.db, args.courseSlug);

		if (!draftContext?.draft) {
			return null;
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

		for (const chapter of chapters) {
			await ctx.db.delete(chapter._id);
		}

		for (const lesson of lessons) {
			await ctx.db.delete(lesson._id);
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

export const importFilesystemCourse = privateMutation({
	args: {
		courseSlug: v.string(),
		title: v.string(),
		description: v.string(),
		language: v.string(),
		resetDraft: v.optional(v.boolean()),
		chapter: v.optional(importDraftChapterValidator),
		lessons: v.optional(v.array(importDraftLessonValidator))
	},
	handler: async (ctx, args) => {
		if (args.resetDraft) {
			const existing = await getActiveDraftContext(ctx.db, args.courseSlug);
			if (existing?.draft) {
				const [chapters, lessons] = await Promise.all([
					ctx.db
						.query('draftChapters')
						.withIndex('by_draftId_order', (q: any) => q.eq('draftId', existing.draft!._id))
						.collect(),
					ctx.db
						.query('draftLessons')
						.withIndex('by_draftId_slug', (q: any) => q.eq('draftId', existing.draft!._id))
						.collect()
				]);

				for (const chapter of chapters) {
					await ctx.db.delete(chapter._id);
				}

				for (const lesson of lessons) {
					await ctx.db.delete(lesson._id);
				}

				await ctx.db.patch(existing.draft._id, {
					status: 'abandoned',
					updatedAt: Date.now()
				});
				await ctx.db.patch(existing.course._id, {
					activeDraftId: undefined,
					updatedAt: Date.now()
				});
			}
		}

		const draftContext = await ensureImportDraft({
			ctx: { db: ctx.db },
			courseSlug: args.courseSlug,
			title: args.title,
			description: args.description,
			language: args.language
		});

		if (!draftContext.draft) {
			throw new Error(`Course ${args.courseSlug} does not have an import draft`);
		}

		if (!args.chapter) {
			return {
				draftId: draftContext.draft._id,
				draftNumber: draftContext.draft.draftNumber
			};
		}

		const now = Date.now();
		const existingChapter = await ctx.db
			.query('draftChapters')
			.withIndex('by_draftId_slug', (q: any) =>
				q.eq('draftId', draftContext.draft!._id).eq('slug', args.chapter!.slug)
			)
			.unique();

		if (existingChapter) {
			await ctx.db.patch(existingChapter._id, {
				order: args.chapter.order,
				title: args.chapter.title,
				description: args.chapter.description,
				updatedAt: now
			});
		} else {
			await ctx.db.insert('draftChapters', {
				courseId: draftContext.course._id,
				draftId: draftContext.draft._id,
				slug: args.chapter.slug,
				order: args.chapter.order,
				title: args.chapter.title,
				description: args.chapter.description,
				createdAt: now,
				updatedAt: now
			});
		}

		const existingLessons = await ctx.db
			.query('draftLessons')
			.withIndex('by_draftId_chapterSlug_order', (q: any) =>
				q.eq('draftId', draftContext.draft!._id).eq('chapterSlug', args.chapter!.slug)
			)
			.collect();

		for (const lesson of existingLessons) {
			await ctx.db.delete(lesson._id);
		}

		for (const lesson of args.lessons ?? []) {
			await ctx.db.insert('draftLessons', {
				courseId: draftContext.course._id,
				draftId: draftContext.draft._id,
				...lesson,
				createdAt: now,
				updatedAt: now
			});
		}

		return {
			draftId: draftContext.draft._id,
			draftNumber: draftContext.draft.draftNumber
		};
	}
});

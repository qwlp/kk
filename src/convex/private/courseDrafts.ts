/* eslint-disable @typescript-eslint/no-explicit-any */
import { v } from 'convex/values';
import type { MutationCtx } from '../_generated/server';
import { getActiveDraftContext, getCourseBySlug, getNextDraftNumber } from './courseHelpers';
import { draftLessonFieldsValidator, importDraftChapterValidator } from './courseValidators';
import { privateMutation, privateQuery } from './helpers';

type MutationDbCtx = {
	db: MutationCtx['db'];
};

const ensureActiveDraft = async ({
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
		throw new Error(`Could not create or load course ${courseSlug}`);
	}

	if (course.activeDraftId) {
		const existingDraft = await ctx.db.get(course.activeDraftId);

		if (existingDraft && existingDraft.status === 'active') {
			await ctx.db.patch(course._id, {
				title,
				description,
				language,
				updatedAt: now
			});
			await ctx.db.patch(existingDraft._id, {
				title,
				description,
				language,
				updatedAt: now
			});

			return {
				course: (await ctx.db.get(course._id)) ?? course,
				draft: (await ctx.db.get(existingDraft._id)) ?? existingDraft
			};
		}
	}

	const fallbackActiveDraft = await ctx.db
		.query('courseDrafts')
		.withIndex('by_courseId_status', (q) => q.eq('courseId', course._id).eq('status', 'active'))
		.unique();

	if (fallbackActiveDraft) {
		await ctx.db.patch(course._id, {
			title,
			description,
			language,
			activeDraftId: fallbackActiveDraft._id,
			updatedAt: now
		});
		await ctx.db.patch(fallbackActiveDraft._id, {
			title,
			description,
			language,
			updatedAt: now
		});

		return {
			course: (await ctx.db.get(course._id)) ?? course,
			draft: (await ctx.db.get(fallbackActiveDraft._id)) ?? fallbackActiveDraft
		};
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

export const getActiveDraft = privateQuery({
	args: {
		courseSlug: v.string()
	},
	handler: async (ctx, args) => {
		const draftContext = await getActiveDraftContext(ctx.db, args.courseSlug);

		if (!draftContext) {
			return null;
		}

		return {
			courseSlug: draftContext.course.slug,
			title: draftContext.course.title,
			description: draftContext.course.description,
			language: draftContext.course.language,
			draft: draftContext.draft
				? {
						id: draftContext.draft._id,
						draftNumber: draftContext.draft.draftNumber,
						status: draftContext.draft.status,
						createdAt: draftContext.draft.createdAt,
						updatedAt: draftContext.draft.updatedAt
					}
				: null
		};
	}
});

export const listDraftChapters = privateQuery({
	args: {
		courseSlug: v.string()
	},
	handler: async (ctx, args) => {
		const draftContext = await getActiveDraftContext(ctx.db, args.courseSlug);

		if (!draftContext?.draft) {
			return [];
		}

		return await ctx.db
			.query('draftChapters')
			.withIndex('by_draftId_order', (q: any) => q.eq('draftId', draftContext.draft!._id))
			.collect();
	}
});

export const listDraftLessonsForChapter = privateQuery({
	args: {
		courseSlug: v.string(),
		chapterSlug: v.string()
	},
	handler: async (ctx, args) => {
		const draftContext = await getActiveDraftContext(ctx.db, args.courseSlug);

		if (!draftContext?.draft) {
			return [];
		}

		return await ctx.db
			.query('draftLessons')
			.withIndex('by_draftId_chapterSlug_order', (q: any) =>
				q.eq('draftId', draftContext.draft!._id).eq('chapterSlug', args.chapterSlug)
			)
			.collect();
	}
});

export const upsertDraftCourse = privateMutation({
	args: {
		courseSlug: v.string(),
		title: v.string(),
		description: v.string(),
		language: v.string()
	},
	handler: async (ctx, args) => {
		const result = await ensureActiveDraft({
			ctx: { db: ctx.db },
			courseSlug: args.courseSlug,
			title: args.title,
			description: args.description,
			language: args.language
		});

		return {
			courseId: result.course._id,
			draftId: result.draft?._id ?? null
		};
	}
});

export const upsertDraftChapter = privateMutation({
	args: {
		courseSlug: v.string(),
		chapter: importDraftChapterValidator
	},
	handler: async (ctx, args) => {
		const draftContext = await getActiveDraftContext(ctx.db, args.courseSlug);

		if (!draftContext) {
			throw new Error(`Course ${args.courseSlug} was not found`);
		}

		const { course, draft } =
			draftContext.draft === null
				? await ensureActiveDraft({
						ctx: { db: ctx.db },
						courseSlug: draftContext.course.slug,
						title: draftContext.course.title,
						description: draftContext.course.description,
						language: draftContext.course.language
					})
				: draftContext;

		if (!draft) {
			throw new Error(`Course ${args.courseSlug} does not have an active draft`);
		}

		const existing = await ctx.db
			.query('draftChapters')
			.withIndex('by_draftId_slug', (q: any) =>
				q.eq('draftId', draft._id).eq('slug', args.chapter.slug)
			)
			.unique();

		const now = Date.now();

		if (existing) {
			await ctx.db.patch(existing._id, {
				order: args.chapter.order,
				title: args.chapter.title,
				description: args.chapter.description,
				updatedAt: now
			});
			return existing._id;
		}

		return await ctx.db.insert('draftChapters', {
			courseId: course._id,
			draftId: draft._id,
			slug: args.chapter.slug,
			order: args.chapter.order,
			title: args.chapter.title,
			description: args.chapter.description,
			createdAt: now,
			updatedAt: now
		});
	}
});

export const upsertDraftLesson = privateMutation({
	args: {
		courseSlug: v.string(),
		lesson: v.object(draftLessonFieldsValidator)
	},
	handler: async (ctx, args) => {
		const draftContext = await getActiveDraftContext(ctx.db, args.courseSlug);

		if (!draftContext) {
			throw new Error(`Course ${args.courseSlug} was not found`);
		}

		const { course, draft } =
			draftContext.draft === null
				? await ensureActiveDraft({
						ctx: { db: ctx.db },
						courseSlug: draftContext.course.slug,
						title: draftContext.course.title,
						description: draftContext.course.description,
						language: draftContext.course.language
					})
				: draftContext;

		if (!draft) {
			throw new Error(`Course ${args.courseSlug} does not have an active draft`);
		}

		const existing = await ctx.db
			.query('draftLessons')
			.withIndex('by_draftId_slug', (q: any) =>
				q.eq('draftId', draft._id).eq('slug', args.lesson.slug)
			)
			.unique();

		const now = Date.now();
		const payload = {
			courseId: course._id,
			draftId: draft._id,
			...args.lesson,
			createdAt: existing?.createdAt ?? now,
			updatedAt: now
		};

		if (existing) {
			await ctx.db.patch(existing._id, payload);
			return existing._id;
		}

		return await ctx.db.insert('draftLessons', payload);
	}
});

export const deleteDraftChapter = privateMutation({
	args: {
		courseSlug: v.string(),
		chapterSlug: v.string()
	},
	handler: async (ctx, args) => {
		const draftContext = await getActiveDraftContext(ctx.db, args.courseSlug);

		if (!draftContext?.draft) {
			return;
		}

		const chapter = await ctx.db
			.query('draftChapters')
			.withIndex('by_draftId_slug', (q: any) =>
				q.eq('draftId', draftContext.draft!._id).eq('slug', args.chapterSlug)
			)
			.unique();

		if (chapter) {
			await ctx.db.delete(chapter._id);
		}

		const lessons = await ctx.db
			.query('draftLessons')
			.withIndex('by_draftId_chapterSlug_order', (q: any) =>
				q.eq('draftId', draftContext.draft!._id).eq('chapterSlug', args.chapterSlug)
			)
			.collect();

		for (const lesson of lessons) {
			await ctx.db.delete(lesson._id);
		}
	}
});

export const deleteDraftLesson = privateMutation({
	args: {
		courseSlug: v.string(),
		lessonSlug: v.string()
	},
	handler: async (ctx, args) => {
		const draftContext = await getActiveDraftContext(ctx.db, args.courseSlug);

		if (!draftContext?.draft) {
			return;
		}

		const lesson = await ctx.db
			.query('draftLessons')
			.withIndex('by_draftId_slug', (q: any) =>
				q.eq('draftId', draftContext.draft!._id).eq('slug', args.lessonSlug)
			)
			.unique();

		if (lesson) {
			await ctx.db.delete(lesson._id);
		}
	}
});

import { v } from 'convex/values';
import { privateMutation, privateQuery } from './helpers';

export const createPending = privateMutation({
	args: {
		courseSlug: v.optional(v.string()),
		chapterSlug: v.optional(v.string()),
		lessonSlug: v.string(),
		courseVersionNumber: v.optional(v.number()),
		lessonVersionId: v.optional(v.id('lessonVersions')),
		code: v.string(),
		mode: v.union(v.literal('console'), v.literal('unit'), v.literal('quiz')),
		createdAt: v.number()
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert('submissions', {
			...args,
			status: 'running',
			stdout: '',
			stderr: '',
			tests: [],
			durationMs: 0
		});
	}
});

export const createCompleted = privateMutation({
	args: {
		courseSlug: v.optional(v.string()),
		chapterSlug: v.optional(v.string()),
		lessonSlug: v.string(),
		courseVersionNumber: v.optional(v.number()),
		lessonVersionId: v.optional(v.id('lessonVersions')),
		code: v.string(),
		mode: v.union(v.literal('console'), v.literal('unit'), v.literal('quiz')),
		status: v.union(
			v.literal('passed'),
			v.literal('failed'),
			v.literal('error'),
			v.literal('timeout'),
			v.literal('runner_error')
		),
		stdout: v.string(),
		stderr: v.string(),
		tests: v.array(
			v.object({
				name: v.string(),
				status: v.union(v.literal('passed'), v.literal('failed'), v.literal('error')),
				visibility: v.union(v.literal('public'), v.literal('hidden')),
				message: v.optional(v.string())
			})
		),
		durationMs: v.number(),
		createdAt: v.number(),
		selectedChoiceId: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert('submissions', args);
	}
});

export const finalize = privateMutation({
	args: {
		id: v.id('submissions'),
		status: v.union(
			v.literal('passed'),
			v.literal('failed'),
			v.literal('error'),
			v.literal('timeout'),
			v.literal('runner_error')
		),
		stdout: v.string(),
		stderr: v.string(),
		tests: v.array(
			v.object({
				name: v.string(),
				status: v.union(v.literal('passed'), v.literal('failed'), v.literal('error')),
				visibility: v.union(v.literal('public'), v.literal('hidden')),
				message: v.optional(v.string())
			})
		),
		durationMs: v.number(),
		selectedChoiceId: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { id, ...fields } = args;
		await ctx.db.patch(id, fields);
	}
});

export const listRecent = privateQuery({
	args: {
		limit: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const docs = await ctx.db
			.query('submissions')
			.order('desc')
			.take(Math.min(args.limit ?? 8, 20));

		return docs.map((doc: (typeof docs)[number]) => ({
			id: doc._id,
			courseSlug: doc.courseSlug,
			chapterSlug: doc.chapterSlug,
			lessonSlug: doc.lessonSlug ?? doc.challengeSlug ?? '',
			courseVersionNumber: doc.courseVersionNumber,
			lessonVersionId: doc.lessonVersionId,
			mode: doc.mode === 'stdin' ? 'console' : doc.mode === 'function' ? 'unit' : doc.mode,
			status: doc.status,
			stdout: doc.stdout,
			stderr: doc.stderr,
			tests: doc.tests,
			durationMs: doc.durationMs,
			createdAt: doc.createdAt,
			code: doc.code,
			selectedChoiceId: doc.selectedChoiceId
		}));
	}
});

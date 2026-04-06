import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	submissions: defineTable({
		lessonSlug: v.optional(v.string()),
		challengeSlug: v.optional(v.string()),
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
	})
});

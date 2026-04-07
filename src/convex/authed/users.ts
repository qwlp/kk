import { v } from 'convex/values';
import type { UserIdentity } from 'convex/server';
import type { Doc, Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { authedMutation, authedQuery } from './helpers';

type UserDoc = Doc<'users'>;
type UserCourseStateDoc = Doc<'userCourseStates'>;

const omitUndefined = <T extends Record<string, unknown>>(value: T) =>
	Object.fromEntries(
		Object.entries(value).filter(
			(entry): entry is [string, Exclude<T[keyof T], undefined>] => entry[1] !== undefined
		)
	);

const formatProfile = (
	user: Pick<UserDoc, '_id' | 'name' | 'email' | 'imageUrl'> | null,
	identity: UserIdentity
) => ({
	id: user?._id ?? null,
	name: user?.name ?? identity.name ?? identity.email ?? 'Google User',
	email: user?.email ?? identity.email ?? null,
	imageUrl: user?.imageUrl ?? identity.pictureUrl ?? null
});

const formatCourseState = (state: UserCourseStateDoc) => ({
	courseSlug: state.courseSlug,
	completedLessonSlugs: state.completedLessonSlugs,
	lastCompletedChapterSlug: state.lastCompletedChapterSlug ?? null,
	lastCompletedLessonSlug: state.lastCompletedLessonSlug ?? null,
	lastActiveChapterSlug: state.lastActiveChapterSlug ?? null,
	lastActiveLessonSlug: state.lastActiveLessonSlug ?? null,
	vimModeEnabled: state.vimModeEnabled ?? false,
	lessonPaneRatio: state.lessonPaneRatio ?? null,
	updatedAt: state.updatedAt
});

const getUserByTokenIdentifier = async (
	db: QueryCtx['db'] | MutationCtx['db'],
	tokenIdentifier: string
) =>
	await db
		.query('users')
		.withIndex('by_tokenIdentifier', (query) => query.eq('tokenIdentifier', tokenIdentifier))
		.unique();

const getUserCourseState = async (
	db: QueryCtx['db'] | MutationCtx['db'],
	userId: Id<'users'>,
	courseSlug: string
) =>
	await db
		.query('userCourseStates')
		.withIndex('by_userId_courseSlug', (query) =>
			query.eq('userId', userId).eq('courseSlug', courseSlug)
		)
		.unique();

const ensureCurrentUserRecord = async (
	ctx: MutationCtx & { identity: UserIdentity }
): Promise<UserDoc> => {
	console.log('authed/users:ensureCurrentUserRecord:start', {
		tokenIdentifier: ctx.identity.tokenIdentifier,
		subject: ctx.identity.subject,
		issuer: ctx.identity.issuer,
		email: ctx.identity.email ?? null
	});

	const existingUser = await getUserByTokenIdentifier(ctx.db, ctx.identity.tokenIdentifier);
	const nextFields = {
		subject: ctx.identity.subject,
		issuer: ctx.identity.issuer
	};
	const optionalProfileFields = omitUndefined({
		name: ctx.identity.name,
		email: ctx.identity.email,
		imageUrl: ctx.identity.pictureUrl
	});
	const now = Date.now();

	if (!existingUser) {
		console.log('authed/users:ensureCurrentUserRecord:creating_user');
		const userId = await ctx.db.insert('users', {
			tokenIdentifier: ctx.identity.tokenIdentifier,
			...nextFields,
			...optionalProfileFields,
			createdAt: now,
			updatedAt: now
		});
		const insertedUser = await ctx.db.get(userId);

		if (!insertedUser) {
			throw new Error('Failed to create authenticated user');
		}

		return insertedUser;
	}

	const hasChanges =
		existingUser.subject !== nextFields.subject ||
		existingUser.issuer !== nextFields.issuer ||
		existingUser.name !== optionalProfileFields.name ||
		existingUser.email !== optionalProfileFields.email ||
		existingUser.imageUrl !== optionalProfileFields.imageUrl;

	if (hasChanges) {
		console.log('authed/users:ensureCurrentUserRecord:patching_user', {
			userId: existingUser._id
		});
		await ctx.db.patch(existingUser._id, {
			...nextFields,
			...optionalProfileFields,
			updatedAt: now
		});
	}

	return {
		...existingUser,
		...nextFields,
		...optionalProfileFields,
		updatedAt: hasChanges ? now : existingUser.updatedAt
	} as UserDoc;
};

export const upsertCurrentUser = authedMutation({
	args: {},
	handler: async (ctx) => {
		const user = await ensureCurrentUserRecord(ctx);

		return formatProfile(user, ctx.identity);
	}
});

export const getCurrentUserOverview = authedQuery({
	args: {},
	handler: async (ctx) => {
		const user = await getUserByTokenIdentifier(ctx.db, ctx.identity.tokenIdentifier);
		const courseStates = user
			? await ctx.db
					.query('userCourseStates')
					.withIndex('by_userId', (query) => query.eq('userId', user._id))
					.collect()
			: [];

		return {
			user: formatProfile(user, ctx.identity),
			courseStates: courseStates.map(formatCourseState)
		};
	}
});

export const setCurrentCoursePreferences = authedMutation({
	args: {
		courseSlug: v.string(),
		vimModeEnabled: v.optional(v.boolean()),
		lessonPaneRatio: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const user = await ensureCurrentUserRecord(ctx);
		const now = Date.now();
		const existingState = await getUserCourseState(ctx.db, user._id, args.courseSlug);

		if (!existingState) {
			const stateId = await ctx.db.insert('userCourseStates', {
				userId: user._id,
				courseSlug: args.courseSlug,
				completedLessonSlugs: [],
				...omitUndefined({
					vimModeEnabled: args.vimModeEnabled,
					lessonPaneRatio: args.lessonPaneRatio
				}),
				createdAt: now,
				updatedAt: now
			});
			const insertedState = await ctx.db.get(stateId);

			if (!insertedState) {
				throw new Error('Failed to store course preferences');
			}

			return formatCourseState(insertedState);
		}

		await ctx.db.patch(existingState._id, {
			vimModeEnabled: args.vimModeEnabled ?? existingState.vimModeEnabled,
			lessonPaneRatio: args.lessonPaneRatio ?? existingState.lessonPaneRatio,
			updatedAt: now
		});

		return formatCourseState({
			...existingState,
			vimModeEnabled: args.vimModeEnabled ?? existingState.vimModeEnabled,
			lessonPaneRatio: args.lessonPaneRatio ?? existingState.lessonPaneRatio,
			updatedAt: now
		});
	}
});

export const setCurrentCourseLastActiveLesson = authedMutation({
	args: {
		courseSlug: v.string(),
		chapterSlug: v.string(),
		lessonSlug: v.string()
	},
	handler: async (ctx, args) => {
		const user = await ensureCurrentUserRecord(ctx);
		const now = Date.now();
		const existingState = await getUserCourseState(ctx.db, user._id, args.courseSlug);

		if (!existingState) {
			const stateId = await ctx.db.insert('userCourseStates', {
				userId: user._id,
				courseSlug: args.courseSlug,
				completedLessonSlugs: [],
				lastActiveChapterSlug: args.chapterSlug,
				lastActiveLessonSlug: args.lessonSlug,
				createdAt: now,
				updatedAt: now
			});
			const insertedState = await ctx.db.get(stateId);

			if (!insertedState) {
				throw new Error('Failed to store active lesson');
			}

			return formatCourseState(insertedState);
		}

		await ctx.db.patch(existingState._id, {
			lastActiveChapterSlug: args.chapterSlug,
			lastActiveLessonSlug: args.lessonSlug,
			updatedAt: now
		});

		return formatCourseState({
			...existingState,
			lastActiveChapterSlug: args.chapterSlug,
			lastActiveLessonSlug: args.lessonSlug,
			updatedAt: now
		});
	}
});

export const markCurrentLessonCompleted = authedMutation({
	args: {
		courseSlug: v.string(),
		chapterSlug: v.string(),
		lessonSlug: v.string()
	},
	handler: async (ctx, args) => {
		const user = await ensureCurrentUserRecord(ctx);
		const now = Date.now();
		const existingState = await getUserCourseState(ctx.db, user._id, args.courseSlug);
		const completedLessonSlugs = existingState
			? Array.from(new Set([...existingState.completedLessonSlugs, args.lessonSlug]))
			: [args.lessonSlug];

		if (!existingState) {
			const stateId = await ctx.db.insert('userCourseStates', {
				userId: user._id,
				courseSlug: args.courseSlug,
				completedLessonSlugs,
				lastCompletedChapterSlug: args.chapterSlug,
				lastCompletedLessonSlug: args.lessonSlug,
				lastActiveChapterSlug: args.chapterSlug,
				lastActiveLessonSlug: args.lessonSlug,
				createdAt: now,
				updatedAt: now
			});
			const insertedState = await ctx.db.get(stateId);

			if (!insertedState) {
				throw new Error('Failed to store course progress');
			}

			return formatCourseState(insertedState);
		}

		await ctx.db.patch(existingState._id, {
			completedLessonSlugs,
			lastCompletedChapterSlug: args.chapterSlug,
			lastCompletedLessonSlug: args.lessonSlug,
			lastActiveChapterSlug: args.chapterSlug,
			lastActiveLessonSlug: args.lessonSlug,
			updatedAt: now
		});

		return formatCourseState({
			...existingState,
			completedLessonSlugs,
			lastCompletedChapterSlug: args.chapterSlug,
			lastCompletedLessonSlug: args.lessonSlug,
			lastActiveChapterSlug: args.chapterSlug,
			lastActiveLessonSlug: args.lessonSlug,
			updatedAt: now
		});
	}
});

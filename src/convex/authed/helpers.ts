import {
	customAction,
	customCtx,
	customMutation,
	customQuery
} from 'convex-helpers/server/customFunctions';
import { action, mutation, query } from '../_generated/server';

const authGuard = customCtx(async (ctx) => {
	const identity = await ctx.auth.getUserIdentity();

	if (!identity) {
		throw new Error('Unauthenticated');
	}

	return { identity };
});

export const authedQuery = customQuery(query, authGuard);
export const authedMutation = customMutation(mutation, authGuard);
export const authedAction = customAction(action, authGuard);

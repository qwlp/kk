import {
	customAction,
	customCtx,
	customMutation,
	customQuery
} from 'convex-helpers/server/customFunctions';
import { action, mutation, query } from '../_generated/server';

const authGuard = customCtx(async (ctx) => {
	let identity = null;

	try {
		identity = await ctx.auth.getUserIdentity();
	} catch (errorValue) {
		console.error('authed/authGuard:getUserIdentity_failed', {
			error: errorValue instanceof Error ? errorValue.message : String(errorValue)
		});
		throw errorValue;
	}

	console.log('authed/authGuard:identity_lookup', {
		tokenIdentifier: identity?.tokenIdentifier ?? null,
		subject: identity?.subject ?? null,
		issuer: identity?.issuer ?? null,
		email: identity?.email ?? null
	});

	if (!identity) {
		throw new Error('Unauthenticated');
	}

	return { identity };
});

export const authedQuery = customQuery(query, authGuard);
export const authedMutation = customMutation(mutation, authGuard);
export const authedAction = customAction(action, authGuard);

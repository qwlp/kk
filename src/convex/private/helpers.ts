// "private" queries/mutations/actions are ones that get called from the SvelteKit backend.
// If CONVEX_PRIVATE_BRIDGE_KEY is configured on the Convex deployment, enforce it.
// If it is unset, allow calls through for a simpler development setup.

import { v } from 'convex/values';
import {
	customAction,
	customCtxAndArgs,
	customMutation,
	customQuery
} from 'convex-helpers/server/customFunctions';
import { action, mutation, query } from '../_generated/server';

const apiKeyGuard = customCtxAndArgs({
	args: { apiKey: v.optional(v.string()) },
	input: async (ctx, { apiKey }) => {
		const expectedApiKey = process.env.CONVEX_PRIVATE_BRIDGE_KEY;

		if (expectedApiKey && apiKey !== expectedApiKey) {
			throw new Error('Invalid API key');
		}

		return { ctx, args: {} };
	}
});

export const privateQuery = customQuery(query, apiKeyGuard);
export const privateMutation = customMutation(mutation, apiKeyGuard);
export const privateAction = customAction(action, apiKeyGuard);

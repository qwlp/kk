import { json } from '@sveltejs/kit';
import { Effect } from 'effect';
import { api } from '../../../../convex/_generated/api';
import { effectRunner } from '$lib/runtime';
import { ConvexPrivateService } from '$lib/services/convex';

export const GET = async () => {
	const recentSubmissionsEffect = Effect.gen(function* () {
		const convex = yield* ConvexPrivateService;
		return yield* convex.query({
			func: api.private.submissions.listRecent,
			args: { limit: 8 }
		});
	});

	const submissions = await effectRunner(recentSubmissionsEffect);

	return json({ submissions });
};

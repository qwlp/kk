import { json } from '@sveltejs/kit';
import { listChallengeSummaries } from '$lib/server/challenges';

export const GET = async () => {
	return json({
		challenges: listChallengeSummaries()
	});
};

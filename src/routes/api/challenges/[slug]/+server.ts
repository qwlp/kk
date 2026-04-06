import { error, json } from '@sveltejs/kit';
import { getPublicChallenge } from '$lib/server/challenges';

export const GET = async ({ params }) => {
	const challenge = getPublicChallenge(params.slug);

	if (!challenge) {
		error(404, {
			message: 'Challenge not found',
			kind: 'challenge_not_found',
			timestamp: Date.now()
		});
	}

	return json({ challenge });
};

import { error } from '@sveltejs/kit';
import {
	listChallengeSummaries,
	defaultChallengeSlug,
	getPublicChallenge
} from '$lib/server/challenges';

export const load = async () => {
	const initialChallenge = getPublicChallenge(defaultChallengeSlug);

	if (!initialChallenge) {
		error(500, {
			message: 'No challenges configured',
			kind: 'challenge_registry_error',
			timestamp: Date.now()
		});
	}

	return {
		challenges: listChallengeSummaries().map(({ slug, title, mode }) => ({ slug, title, mode })),
		initialChallenge
	};
};

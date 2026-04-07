import type { AuthConfig } from 'convex/server';

const googleClientId = process.env.PUBLIC_GOOGLE_CLIENT_ID;

export default {
	providers: googleClientId
		? [
				{
					domain: 'https://accounts.google.com',
					applicationID: googleClientId
				},
				{
					domain: 'accounts.google.com',
					applicationID: googleClientId
				}
			]
		: []
} satisfies AuthConfig;

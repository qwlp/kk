import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import { ConvexClient } from 'convex/browser';
import { writable } from 'svelte/store';
import { api } from '../../convex/_generated/api';
import { CONVEX_URL } from '$lib/convex-env';

type AuthStatus = 'booting' | 'signed_out' | 'signing_in' | 'signed_in' | 'error';

export type AuthenticatedUser = {
	id: string | null;
	name: string;
	email: string | null;
	imageUrl: string | null;
};

export type UserCourseState = {
	courseSlug: string;
	completedLessonSlugs: string[];
	lastCompletedChapterSlug: string | null;
	lastCompletedLessonSlug: string | null;
	lastActiveChapterSlug: string | null;
	lastActiveLessonSlug: string | null;
	vimModeEnabled: boolean;
	lessonPaneRatio: number | null;
	updatedAt: number;
};

type AuthState = {
	status: AuthStatus;
	user: AuthenticatedUser | null;
	courseStates: Record<string, UserCourseState>;
	errorMessage: string | null;
	googleClientConfigured: boolean;
};

type GoogleCredentialResponse = {
	credential?: string;
	select_by?: string;
};

type GoogleButtonOptions = {
	theme?: 'outline' | 'filled_black';
	size?: 'large' | 'medium' | 'small';
	text?: 'signin_with' | 'continue_with' | 'signup_with';
	shape?: 'pill' | 'rectangular';
	width?: number;
	logo_alignment?: 'left' | 'center';
};

type GoogleIdentity = {
	accounts: {
		id: {
			initialize: (options: {
				client_id: string;
				callback: (response: GoogleCredentialResponse) => void;
				auto_select?: boolean;
				use_fedcm_for_prompt?: boolean;
			}) => void;
			renderButton: (element: HTMLElement, options: GoogleButtonOptions) => void;
			prompt: () => void;
			disableAutoSelect: () => void;
		};
	};
};

const TOKEN_STORAGE_KEY = 'kk-google-id-token';
const GOOGLE_CLIENT_ID = env.PUBLIC_GOOGLE_CLIENT_ID ?? '';

const initialState: AuthState = {
	status: browser ? 'booting' : 'signed_out',
	user: null,
	courseStates: {},
	errorMessage: null,
	googleClientConfigured: GOOGLE_CLIENT_ID.length > 0
};

export const authState = writable<AuthState>(initialState);

let convexClient: ConvexClient | null = null;
let initializePromise: Promise<void> | null = null;
let googleLibraryPromise: Promise<GoogleIdentity | null> | null = null;
let googleInitialized = false;
let currentToken: string | null = null;

const toCourseStateMap = (courseStates: UserCourseState[]) =>
	Object.fromEntries(courseStates.map((courseState) => [courseState.courseSlug, courseState]));

const getGoogleIdentity = () =>
	typeof window !== 'undefined'
		? ((window as typeof window & { google?: GoogleIdentity }).google ?? null)
		: null;

const decodeBase64Url = (value: string) => {
	const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
	const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

	return atob(padded);
};

const decodeJwtPayload = (token: string) => {
	const payload = token.split('.')[1];
	if (!payload) return null;

	try {
		const decoded = decodeBase64Url(payload);
		return JSON.parse(decoded) as { exp?: number };
	} catch {
		return null;
	}
};

const isTokenValid = (token: string | null) => {
	if (!token) return false;

	const payload = decodeJwtPayload(token);
	const expiresAt = payload?.exp;

	if (!expiresAt) return false;

	return expiresAt * 1000 > Date.now() + 30_000;
};

const readStoredToken = () => {
	if (!browser) return null;

	const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
	return isTokenValid(storedToken) ? storedToken : null;
};

const persistToken = (token: string | null) => {
	if (!browser) return;

	if (token) {
		window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
		return;
	}

	window.localStorage.removeItem(TOKEN_STORAGE_KEY);
};

const ensureConvexClient = () => {
	if (!browser) {
		throw new Error('Browser auth can only be used in the browser');
	}

	if (!CONVEX_URL) {
		throw new Error('PUBLIC_CONVEX_URL is not configured');
	}

	if (!convexClient) {
		convexClient = new ConvexClient(CONVEX_URL);
	}

	return convexClient;
};

const applyAuthToken = (token: string | null) => {
	currentToken = isTokenValid(token) ? token : null;
	persistToken(currentToken);

	const client = ensureConvexClient();

	client.setAuth(async () => {
		if (isTokenValid(currentToken)) {
			return currentToken;
		}

		const restoredToken = readStoredToken();
		currentToken = restoredToken;
		return restoredToken;
	});
};

const loadGoogleIdentityLibrary = async (): Promise<GoogleIdentity | null> => {
	if (!browser || !GOOGLE_CLIENT_ID) return null;

	const existingGoogle = getGoogleIdentity();
	if (existingGoogle) return existingGoogle;

	if (googleLibraryPromise) {
		return googleLibraryPromise;
	}

	googleLibraryPromise = new Promise<GoogleIdentity | null>((resolve, reject) => {
		const existingScript = document.querySelector<HTMLScriptElement>(
			'script[data-google-identity="true"]'
		);

		if (existingScript) {
			existingScript.addEventListener('load', () => resolve(getGoogleIdentity()), { once: true });
			existingScript.addEventListener(
				'error',
				() => reject(new Error('Failed to load Google Identity Services')),
				{
					once: true
				}
			);
			return;
		}

		const script = document.createElement('script');
		script.src = 'https://accounts.google.com/gsi/client';
		script.async = true;
		script.defer = true;
		script.dataset.googleIdentity = 'true';
		script.onload = () => resolve(getGoogleIdentity());
		script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
		document.head.append(script);
	});

	return googleLibraryPromise;
};

const refreshOverview = async () => {
	const client = ensureConvexClient();
	const overview = await client.query(api.authed.users.getCurrentUserOverview, {});

	authState.set({
		status: 'signed_in',
		user: overview.user,
		courseStates: toCourseStateMap(overview.courseStates),
		errorMessage: null,
		googleClientConfigured: GOOGLE_CLIENT_ID.length > 0
	});
};

const handleCredentialResponse = async (response: GoogleCredentialResponse) => {
	if (!response.credential) {
		authState.update((state) => ({
			...state,
			status: 'error',
			errorMessage: 'Google sign-in did not return a credential.'
		}));
		return;
	}

	authState.update((state) => ({
		...state,
		status: 'signing_in',
		errorMessage: null
	}));

	try {
		applyAuthToken(response.credential);
		const client = ensureConvexClient();
		await client.mutation(api.authed.users.upsertCurrentUser, {});
		await refreshOverview();
	} catch (errorValue) {
		applyAuthToken(null);
		authState.update((state) => ({
			...state,
			status: 'error',
			user: null,
			courseStates: {},
			errorMessage:
				errorValue instanceof Error ? errorValue.message : 'Google sign-in could not be completed.'
		}));
	}
};

const initializeGoogle = async () => {
	if (!browser || !GOOGLE_CLIENT_ID) return null;

	const google = await loadGoogleIdentityLibrary();
	if (!google || googleInitialized) return google;

	google.accounts.id.initialize({
		client_id: GOOGLE_CLIENT_ID,
		callback: (response) => {
			void handleCredentialResponse(response);
		},
		auto_select: true,
		use_fedcm_for_prompt: true
	});
	googleInitialized = true;

	return google;
};

const mergeCourseState = (courseState: UserCourseState) => {
	authState.update((state) => ({
		...state,
		courseStates: {
			...state.courseStates,
			[courseState.courseSlug]: courseState
		}
	}));
};

const requireSignedInClient = () => {
	const client = ensureConvexClient();

	if (!isTokenValid(currentToken)) {
		throw new Error('You need to sign in with Google first.');
	}

	return client;
};

export const authActions = {
	initialize: async () => {
		if (!browser) return;

		if (initializePromise) {
			return initializePromise;
		}

		initializePromise = (async () => {
			try {
				ensureConvexClient();
				applyAuthToken(readStoredToken());
				await initializeGoogle();

				if (!currentToken) {
					authState.update((state) => ({
						...state,
						status: 'signed_out',
						errorMessage: null
					}));
					return;
				}

				const client = ensureConvexClient();
				await client.mutation(api.authed.users.upsertCurrentUser, {});
				await refreshOverview();
			} catch (errorValue) {
				applyAuthToken(null);
				authState.update((state) => ({
					...state,
					status: 'error',
					user: null,
					courseStates: {},
					errorMessage:
						errorValue instanceof Error
							? errorValue.message
							: 'Authentication could not be initialized.'
				}));
			}
		})();

		return initializePromise;
	},

	renderGoogleButton: async (
		element: HTMLElement,
		options: GoogleButtonOptions = {
			theme: 'filled_black',
			size: 'large',
			text: 'continue_with',
			shape: 'pill',
			logo_alignment: 'left'
		}
	) => {
		if (!browser || !GOOGLE_CLIENT_ID) return;

		await authActions.initialize();
		const google = await initializeGoogle();
		if (!google) return;

		element.innerHTML = '';
		google.accounts.id.renderButton(element, options);
	},

	prompt: async () => {
		if (!browser || !GOOGLE_CLIENT_ID || currentToken) return;

		await authActions.initialize();
		const google = await initializeGoogle();
		google?.accounts.id.prompt();
	},

	signOut: () => {
		if (!browser) return;

		getGoogleIdentity()?.accounts.id.disableAutoSelect();
		applyAuthToken(null);
		authState.set({
			status: 'signed_out',
			user: null,
			courseStates: {},
			errorMessage: null,
			googleClientConfigured: GOOGLE_CLIENT_ID.length > 0
		});
	},

	refreshOverview,

	setCurrentCoursePreferences: async (args: {
		courseSlug: string;
		vimModeEnabled?: boolean;
		lessonPaneRatio?: number;
	}) => {
		const client = requireSignedInClient();
		const courseState = await client.mutation(api.authed.users.setCurrentCoursePreferences, args);
		mergeCourseState(courseState);
	},

	setCurrentCourseLastActiveLesson: async (args: {
		courseSlug: string;
		chapterSlug: string;
		lessonSlug: string;
	}) => {
		const client = requireSignedInClient();
		const courseState = await client.mutation(
			api.authed.users.setCurrentCourseLastActiveLesson,
			args
		);
		mergeCourseState(courseState);
	},

	markCurrentLessonCompleted: async (args: {
		courseSlug: string;
		chapterSlug: string;
		lessonSlug: string;
	}) => {
		const client = requireSignedInClient();
		const courseState = await client.mutation(api.authed.users.markCurrentLessonCompleted, args);
		mergeCourseState(courseState);
	}
};

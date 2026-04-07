import { browser } from '$app/environment';
import { preloadData } from '$app/navigation';
import { resolve } from '$app/paths';
import type { LessonNavigationTarget } from '$lib/types';

export type LessonPrefetchPriority = 'high' | 'medium' | 'low';

type LessonPrefetchStatus = 'queued' | 'inflight' | 'done' | 'failed';
type IdleHandle = number;
type IdleDeadlineLike = {
	didTimeout: boolean;
	timeRemaining: () => number;
};
type IdleCallback = (deadline: IdleDeadlineLike) => void;
type IdleSchedulerWindow = Window &
	typeof globalThis & {
		requestIdleCallback?: (callback: IdleCallback, options?: { timeout?: number }) => IdleHandle;
		cancelIdleCallback?: (handle: IdleHandle) => void;
	};

const BACKGROUND_CONCURRENCY = 1;

const statusByHref = new Map<string, LessonPrefetchStatus>();
const mediumQueue: string[] = [];
const lowQueue: string[] = [];

let activeBackgroundCount = 0;
let lowPriorityPaused = false;
let mediumPumpScheduled = false;
let idleHandle: IdleHandle | null = null;
let lowFallbackTimeout: number | null = null;

const getIdleSchedulerWindow = (): IdleSchedulerWindow => window as IdleSchedulerWindow;

const getLessonSlug = (target: LessonNavigationTarget) =>
	'lessonSlug' in target ? target.lessonSlug : target.slug;

export const toLessonHref = (target: LessonNavigationTarget) =>
	resolve('/app/[chapterSlug]/[lessonSlug]', {
		chapterSlug: target.chapterSlug,
		lessonSlug: getLessonSlug(target)
	});

const beginPrefetch = (href: string) => {
	statusByHref.set(href, 'inflight');

	void preloadData(href)
		.then(() => {
			statusByHref.set(href, 'done');
		})
		.catch(() => {
			statusByHref.set(href, 'failed');
		});
};

const cancelLowPump = () => {
	const idleScheduler = browser ? getIdleSchedulerWindow() : null;
	if (idleHandle !== null && idleScheduler?.cancelIdleCallback) {
		idleScheduler.cancelIdleCallback(idleHandle);
		idleHandle = null;
	}

	if (lowFallbackTimeout !== null) {
		window.clearTimeout(lowFallbackTimeout);
		lowFallbackTimeout = null;
	}
};

const pumpBackgroundQueues = () => {
	if (!browser) return;

	while (activeBackgroundCount < BACKGROUND_CONCURRENCY && mediumQueue.length > 0) {
		const href = mediumQueue.shift();
		if (!href) continue;
		if (statusByHref.get(href) !== 'queued') continue;

		activeBackgroundCount += 1;
		statusByHref.set(href, 'inflight');

		void preloadData(href)
			.then(() => {
				statusByHref.set(href, 'done');
			})
			.catch(() => {
				statusByHref.set(href, 'failed');
			})
			.finally(() => {
				activeBackgroundCount = Math.max(0, activeBackgroundCount - 1);
				pumpBackgroundQueues();
			});
	}

	if (activeBackgroundCount >= BACKGROUND_CONCURRENCY || mediumQueue.length > 0) {
		return;
	}

	if (lowPriorityPaused || lowQueue.length === 0) {
		cancelLowPump();
		return;
	}

	if (idleHandle !== null || lowFallbackTimeout !== null) {
		return;
	}

	const idleScheduler = getIdleSchedulerWindow();
	const onIdle = () => {
		idleHandle = null;
		lowFallbackTimeout = null;

		if (lowPriorityPaused || activeBackgroundCount >= BACKGROUND_CONCURRENCY) {
			return;
		}

		const href = lowQueue.shift();
		if (!href) return;
		if (statusByHref.get(href) !== 'queued') {
			pumpBackgroundQueues();
			return;
		}

		activeBackgroundCount += 1;
		statusByHref.set(href, 'inflight');

		void preloadData(href)
			.then(() => {
				statusByHref.set(href, 'done');
			})
			.catch(() => {
				statusByHref.set(href, 'failed');
			})
			.finally(() => {
				activeBackgroundCount = Math.max(0, activeBackgroundCount - 1);
				pumpBackgroundQueues();
			});
	};

	if (idleScheduler.requestIdleCallback) {
		idleHandle = idleScheduler.requestIdleCallback(() => onIdle(), { timeout: 1200 });
		return;
	}

	lowFallbackTimeout = window.setTimeout(onIdle, 200);
};

const scheduleMediumPump = () => {
	if (mediumPumpScheduled || !browser) return;

	mediumPumpScheduled = true;
	queueMicrotask(() => {
		mediumPumpScheduled = false;
		pumpBackgroundQueues();
	});
};

export const prefetchLesson = (
	target: LessonNavigationTarget | null,
	priority: LessonPrefetchPriority = 'high'
) => {
	if (!browser || !target) return;

	const href = toLessonHref(target);
	const status = statusByHref.get(href);

	if (priority === 'high' && status === 'queued') {
		beginPrefetch(href);
		return;
	}

	if (status !== undefined) return;

	if (priority === 'high') {
		beginPrefetch(href);
		return;
	}

	statusByHref.set(href, 'queued');

	if (priority === 'medium') {
		mediumQueue.push(href);
		scheduleMediumPump();
		return;
	}

	lowQueue.push(href);
	pumpBackgroundQueues();
};

export const prefetchLessonBatch = (
	targets: Iterable<LessonNavigationTarget | null>,
	priority: LessonPrefetchPriority
) => {
	for (const target of targets) {
		prefetchLesson(target, priority);
	}
};

export const setLessonPrefetchLowPriorityPaused = (paused: boolean) => {
	lowPriorityPaused = paused;

	if (paused) {
		cancelLowPump();
		return;
	}

	pumpBackgroundQueues();
};

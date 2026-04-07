<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		prefetchLesson,
		prefetchLessonBatch,
		setLessonPrefetchLowPriorityPaused
	} from '$lib/app/lesson-prefetch';
	import CodingLessonWorkspace from '$lib/components/app/CodingLessonWorkspace.svelte';
	import LessonHeader from '$lib/components/app/LessonHeader.svelte';
	import LessonReaderPane from '$lib/components/app/LessonReaderPane.svelte';
	import QuizLessonWorkspace from '$lib/components/app/QuizLessonWorkspace.svelte';
	import { onMount, untrack } from 'svelte';
	import type {
		LessonNavigationTarget,
		LessonRunResponse,
		LessonSubmitResponse,
		LessonSummary,
		PublicLesson,
		RunIntent
	} from '$lib/types';
	import type { PageData } from './$types';

	type ConfettiPiece = {
		id: number;
		left: number;
		size: number;
		rotation: number;
		duration: number;
		delay: number;
		color: string;
	};

	type Toast = {
		id: number;
		tone: 'success' | 'error';
		title: string;
		message: string;
		durationMs: number;
	};

	type HorizontalResizeState = {
		pointerId: number;
	};

	type NetworkInformationLike = {
		saveData?: boolean;
		effectiveType?: string;
	};

	let { data }: { data: PageData } = $props();
	const initialLesson = untrack(() => data.currentLesson);

	const currentLesson = $derived.by(() => data.currentLesson);
	const sequence = $derived.by(() => data.sequence);
	const chapterTargets = $derived.by(() => data.chapterTargets);
	const currentChapter = $derived.by(() => {
		const chapter = data.chapters.find((item) => item.slug === currentLesson.chapterSlug);
		if (!chapter) {
			throw new Error(`Could not find chapter for lesson ${currentLesson.slug}.`);
		}
		return chapter;
	});
	const lessonsInChapter = $derived.by(() =>
		sequence
			.filter((lesson) => lesson.chapterSlug === currentChapter.slug)
			.map(
				(lesson): LessonSummary => ({
					slug: lesson.slug,
					chapterSlug: lesson.chapterSlug,
					order: lesson.order,
					title: lesson.title,
					mode: lesson.mode
				})
			)
	);
	const currentLessonIndex = $derived.by(() => {
		const lessonIndex = sequence.findIndex(
			(item) => item.chapterSlug === currentLesson.chapterSlug && item.slug === currentLesson.slug
		);
		if (lessonIndex < 0) {
			throw new Error(`Could not find lesson ${currentLesson.slug} in the course sequence.`);
		}
		return lessonIndex;
	});
	const previousLesson = $derived.by(() => sequence[currentLessonIndex - 1] ?? null);
	const nextLesson = $derived.by(() => sequence[currentLessonIndex + 1] ?? null);

	let code = $state(initialLesson.mode === 'quiz' ? '' : initialLesson.starterCode);
	let result = $state<LessonRunResponse | LessonSubmitResponse | null>(null);
	let running = $state<RunIntent | null>(null);
	let submissionError = $state<string | null>(null);
	let vimModeEnabled = $state(false);
	let completedLessons = $state<string[]>([]);
	let confettiPieces = $state<ConfettiPiece[]>([]);
	let edgeFlashTone = $state<'error' | null>(null);
	let toasts = $state<Toast[]>([]);
	let draftCodes = $state<Record<string, string>>(
		initialLesson.mode === 'quiz' ? {} : { [initialLesson.slug]: initialLesson.starterCode }
	);
	let selectedChoiceId = $state('');
	let submittedQuizChoices = $state<Record<string, string>>({});
	let syncedLessonSlug = $state(initialLesson.slug);
	let desktopSplitPaneElement = $state<HTMLDivElement | null>(null);
	let lessonPaneRatio = $state(0.46);
	let horizontalResizeState = $state<HorizontalResizeState | null>(null);
	let documentHidden = $state(false);

	const editorValue = $derived.by(() => {
		if (currentLesson.mode === 'quiz') return '';
		return code;
	});
	const terminalOutput = $derived.by(() => {
		if (submissionError) return submissionError;
		if (!result) return '';
		if (result.stdout && result.stdout.trim().length > 0) return result.stdout.trimEnd();
		if (result.stderr && result.stderr.trim().length > 0) return result.stderr.trimEnd();
		const firstIssue = result.tests?.find((test) => test.status !== 'passed')?.message;
		if (firstIssue) return firstIssue;
		return result.status === 'passed'
			? `Passed in ${result.durationMs} ms`
			: `${result.status.toUpperCase()} in ${result.durationMs} ms`;
	});

	onMount(() => {
		if (!browser) return;

		documentHidden = document.hidden;

		const storedVimMode = window.localStorage.getItem('kk-editor-vim-mode');
		vimModeEnabled = storedVimMode === 'true';

		const storedCompletedLessons = window.localStorage.getItem('kk-completed-lessons');
		if (storedCompletedLessons) {
			try {
				const parsed = JSON.parse(storedCompletedLessons);
				if (Array.isArray(parsed) && parsed.every((value) => typeof value === 'string')) {
					completedLessons = parsed;
				}
			} catch {
				completedLessons = [];
			}
		}

		const storedLessonPaneRatio = window.localStorage.getItem('kk-lesson-pane-ratio');
		if (storedLessonPaneRatio) {
			const parsed = Number.parseFloat(storedLessonPaneRatio);
			if (Number.isFinite(parsed)) {
				lessonPaneRatio = Math.min(Math.max(parsed, 0.25), 0.7);
			}
		}

		const handleVisibilityChange = () => {
			documentHidden = document.hidden;
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			setLessonPrefetchLowPriorityPaused(false);
		};
	});

	$effect(() => {
		if (!browser) return;
		window.localStorage.setItem('kk-editor-vim-mode', String(vimModeEnabled));
	});

	$effect(() => {
		if (!browser) return;
		window.localStorage.setItem('kk-completed-lessons', JSON.stringify(completedLessons));
	});

	$effect(() => {
		if (!browser) return;
		window.localStorage.setItem('kk-lesson-pane-ratio', String(lessonPaneRatio));
	});

	$effect(() => {
		if (currentLesson.slug === syncedLessonSlug) return;

		syncedLessonSlug = currentLesson.slug;
		result = null;
		submissionError = null;

		if (currentLesson.mode === 'quiz') {
			selectedChoiceId = submittedQuizChoices[currentLesson.slug] ?? '';
			return;
		}

		selectedChoiceId = '';
		code = draftCodes[currentLesson.slug] ?? currentLesson.starterCode;
	});

	$effect(() => {
		if (!browser) return;
		setLessonPrefetchLowPriorityPaused(running !== null || documentHidden);
	});

	$effect(() => {
		if (!browser) return;

		prefetchLesson(previousLesson, 'high');
		prefetchLesson(nextLesson, 'high');

		prefetchLessonBatch(
			lessonsInChapter.filter((lesson) => lesson.slug !== currentLesson.slug),
			'medium'
		);

		const lowPriorityWarmupTimeout = window.setTimeout(() => {
			const connection = (navigator as Navigator & { connection?: NetworkInformationLike })
				.connection;
			const shouldSkipLowPriorityWarmup =
				connection?.saveData === true ||
				connection?.effectiveType === 'slow-2g' ||
				connection?.effectiveType === '2g';

			if (shouldSkipLowPriorityWarmup) {
				return;
			}

			prefetchLessonBatch(
				sequence.filter(
					(lesson) =>
						!(
							lesson.chapterSlug === currentLesson.chapterSlug && lesson.slug === currentLesson.slug
						)
				),
				'low'
			);
		}, 1000);

		return () => {
			window.clearTimeout(lowPriorityWarmupTimeout);
		};
	});

	function handlePrefetchIntent(target: LessonNavigationTarget | null) {
		prefetchLesson(target, 'high');
	}

	async function navigateToLesson(target: LessonNavigationTarget | null) {
		if (!target) return;

		if (currentLesson.mode !== 'quiz') {
			draftCodes[currentLesson.slug] = code;
		}

		prefetchLesson(target, 'high');
		await goto(
			resolve('/app/[chapterSlug]/[lessonSlug]', {
				chapterSlug: target.chapterSlug,
				lessonSlug: 'lessonSlug' in target ? target.lessonSlug : target.slug
			})
		);
	}

	function handleChapterSelect(chapterSlug: string) {
		void navigateToLesson(chapterTargets[chapterSlug] ?? null);
	}

	function handleLessonSelect(lessonSlug: string) {
		void navigateToLesson({
			chapterSlug: currentChapter.slug,
			lessonSlug
		});
	}

	function handleCodeChange(nextValue: string) {
		code = nextValue;
		draftCodes[currentLesson.slug] = nextValue;
	}

	function triggerConfetti() {
		confettiPieces = Array.from({ length: 28 }, (_, index) => ({
			id: Date.now() + index,
			left: Math.random() * 100,
			size: 8 + Math.random() * 10,
			rotation: Math.random() * 360,
			duration: 1000 + Math.random() * 900,
			delay: Math.random() * 120,
			color: ['#ffe287', '#ffb84d', '#9ad6ff', '#f5f7fb'][index % 4]!
		}));

		window.setTimeout(() => {
			confettiPieces = [];
		}, 2200);
	}

	function triggerFailureFlash() {
		edgeFlashTone = 'error';
		window.setTimeout(() => {
			edgeFlashTone = null;
		}, 850);
	}

	function pushToast(toast: Omit<Toast, 'id'>) {
		const id = Date.now() + Math.floor(Math.random() * 1000);
		toasts = [...toasts, { id, ...toast }];

		window.setTimeout(() => {
			dismissToast(id);
		}, toast.durationMs);
	}

	function dismissToast(id: number) {
		toasts = toasts.filter((item) => item.id !== id);
	}

	function startHorizontalResize(event: PointerEvent) {
		if (!desktopSplitPaneElement) return;

		event.preventDefault();
		(event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId);
		horizontalResizeState = {
			pointerId: event.pointerId
		};
	}

	function handleWindowPointerMove(event: PointerEvent) {
		if (!horizontalResizeState || event.pointerId !== horizontalResizeState.pointerId) return;
		if (!desktopSplitPaneElement) return;

		const bounds = desktopSplitPaneElement.getBoundingClientRect();
		if (bounds.width <= 0) return;

		const nextRatio = (event.clientX - bounds.left) / bounds.width;
		lessonPaneRatio = Math.min(Math.max(nextRatio, 0.25), 0.7);
	}

	function stopHorizontalResize(event: PointerEvent) {
		if (!horizontalResizeState || event.pointerId !== horizontalResizeState.pointerId) return;

		horizontalResizeState = null;
	}

	function markLessonComplete(lesson: PublicLesson) {
		if (completedLessons.includes(lesson.slug)) return;
		completedLessons = [...completedLessons, lesson.slug];
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (!browser || event.repeat || event.altKey) return;

		const hasShortcutModifier = event.ctrlKey || event.metaKey;
		if (!hasShortcutModifier) return;

		if (event.key === ',') {
			event.preventDefault();
			void navigateToLesson(previousLesson);
			return;
		}

		if (event.key === '.') {
			event.preventDefault();
			void navigateToLesson(nextLesson);
			return;
		}

		if (event.key !== 'Enter' || running) return;

		event.preventDefault();

		if (event.shiftKey) {
			void submitCurrentLesson();
			return;
		}

		if (currentLesson.mode !== 'quiz') {
			void runCodingLesson();
		}
	}

	async function runCodingLesson() {
		if (currentLesson.mode === 'quiz') return;

		running = 'run';
		submissionError = null;
		result = null;

		try {
			const response = await fetch('/api/lessons/run', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					lessonSlug: currentLesson.slug,
					code
				})
			});
			const payload = await response.json();

			if (!response.ok) {
				submissionError = payload?.message ?? 'The runner could not process this lesson.';
				return;
			}

			result = payload satisfies LessonRunResponse;
		} catch (errorValue) {
			submissionError =
				errorValue instanceof Error
					? errorValue.message
					: 'The runner could not process this lesson.';
		} finally {
			running = null;
		}
	}

	async function submitCurrentLesson() {
		running = 'submit';
		submissionError = null;
		result = null;

		try {
			const response = await fetch('/api/lessons/submit', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify(
					currentLesson.mode === 'quiz'
						? {
								lessonSlug: currentLesson.slug,
								selectedChoiceId
							}
						: {
								lessonSlug: currentLesson.slug,
								code
							}
				)
			});
			const payload = await response.json();

			if (!response.ok) {
				submissionError = payload?.message ?? 'The runner could not process this lesson.';
				triggerFailureFlash();
				pushToast({
					tone: 'error',
					title: 'Submission failed',
					message: submissionError ?? 'Submission failed',
					durationMs: 2600
				});
				return;
			}

			result = payload satisfies LessonSubmitResponse;

			if (currentLesson.mode === 'quiz') {
				submittedQuizChoices[currentLesson.slug] = selectedChoiceId;
			}

			if (payload.status === 'passed') {
				markLessonComplete(currentLesson);
				triggerConfetti();
				pushToast({
					tone: 'success',
					title: 'Correct!',
					message: '',
					durationMs: 2400
				});
			} else {
				triggerFailureFlash();
				pushToast({
					tone: 'error',
					title: 'Incorrect',
					message:
						payload.status === 'failed'
							? 'Your solution did not pass yet.'
							: 'The submission did not complete successfully.',
					durationMs: 2600
				});
			}
		} catch (errorValue) {
			submissionError =
				errorValue instanceof Error
					? errorValue.message
					: 'The runner could not process this lesson.';
			triggerFailureFlash();
			pushToast({
				tone: 'error',
				title: 'Submission failed',
				message: submissionError,
				durationMs: 2600
			});
		} finally {
			running = null;
		}
	}
</script>

<svelte:window
	onkeydown={handleWindowKeydown}
	onpointermove={handleWindowPointerMove}
	onpointerup={stopHorizontalResize}
	onpointercancel={stopHorizontalResize}
/>

<div class="fantasy-shell h-screen overflow-hidden bg-[var(--kk-bg)] text-[var(--kk-text)]">
	<div class="fantasy-backdrop pointer-events-none absolute inset-0"></div>
	{#if edgeFlashTone === 'error'}
		<div class="screen-edge-flash pointer-events-none absolute inset-0 z-40"></div>
	{/if}
	{#if confettiPieces.length > 0}
		<div class="pointer-events-none absolute inset-x-0 top-0 z-30 h-52 overflow-hidden">
			{#each confettiPieces as piece (piece.id)}
				<span
					class="confetti-piece absolute top-0"
					style={`left:${piece.left}%;width:${piece.size}px;height:${piece.size * 0.6}px;background:${piece.color};transform:rotate(${piece.rotation}deg);animation-duration:${piece.duration}ms;animation-delay:${piece.delay}ms;`}
				></span>
			{/each}
		</div>
	{/if}
	{#if toasts.length > 0}
		<div
			class="absolute right-4 bottom-4 z-50 flex w-[32rem] max-w-[calc(100vw-2rem)] flex-col gap-3"
		>
			{#each toasts as toast (toast.id)}
				<div
					class={`toast-card toast-slide relative overflow-hidden rounded-2xl border px-5 py-5 shadow-[0_18px_40px_rgba(0,0,0,0.3)] backdrop-blur ${
						toast.tone === 'success'
							? 'border-[var(--kk-accent)] text-[var(--kk-text)]'
							: 'border-[#d85c6d] text-[#ffd8df]'
					}`}
				>
					<div class="flex items-center gap-4">
						<div
							class={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${
								toast.tone === 'success'
									? 'bg-[var(--kk-text)] text-[#351323]'
									: 'bg-[#f4d9de] text-[#4b1823]'
							}`}
						>
							{#if toast.tone === 'success'}
								<svg viewBox="0 0 24 24" class="h-6 w-6" aria-hidden="true">
									<path
										fill="currentColor"
										d="M9.55 16.6 5.4 12.45l1.4-1.4 2.75 2.75 7.65-7.65 1.4 1.4Z"
									/>
								</svg>
							{:else}
								<svg viewBox="0 0 24 24" class="h-6 w-6" aria-hidden="true">
									<path
										fill="currentColor"
										d="m12 10.586 4.95-4.95 1.414 1.414L13.414 12l4.95 4.95-1.414 1.414L12 13.414l-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636Z"
									/>
								</svg>
							{/if}
						</div>

						<div class="min-w-0 flex-1">
							<p class="font-mono text-[1.05rem] leading-none font-semibold">{toast.title}</p>
							{#if toast.message}
								<p class="mt-2 font-mono text-sm leading-6 opacity-80">{toast.message}</p>
							{/if}
						</div>

						<button
							type="button"
							onclick={() => dismissToast(toast.id)}
							class="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[var(--kk-text-dim)] transition hover:bg-white/5 hover:text-white"
							aria-label="Dismiss notification"
						>
							<svg viewBox="0 0 24 24" class="h-6 w-6" aria-hidden="true">
								<path
									fill="currentColor"
									d="m12 10.586 4.95-4.95 1.414 1.414L13.414 12l4.95 4.95-1.414 1.414L12 13.414l-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636Z"
								/>
							</svg>
						</button>
					</div>

					<div
						class={`toast-progress absolute right-0 bottom-0 left-0 h-2 origin-left ${
							toast.tone === 'success' ? 'bg-[var(--kk-accent)]' : 'bg-[#d85c6d]'
						}`}
						style={`animation-duration:${toast.durationMs}ms;`}
					></div>
				</div>
			{/each}
		</div>
	{/if}

	<div class="relative flex h-full flex-col">
		<LessonHeader
			chapters={data.chapters}
			{chapterTargets}
			{currentChapter}
			{lessonsInChapter}
			completedLessonSlugs={completedLessons}
			{currentLesson}
			{previousLesson}
			{nextLesson}
			{vimModeEnabled}
			showSettings={currentLesson.mode !== 'quiz'}
			onToggleVim={() => (vimModeEnabled = !vimModeEnabled)}
			onChapterSelect={handleChapterSelect}
			onLessonSelect={handleLessonSelect}
			onNavigateLesson={(lesson) => void navigateToLesson(lesson)}
			onPrefetchLesson={handlePrefetchIntent}
		/>

		<div
			bind:this={desktopSplitPaneElement}
			class="relative z-0 flex min-h-0 flex-1 flex-col lg:flex-row"
			class:select-none={horizontalResizeState !== null}
			style={`--kk-lesson-pane-width:${lessonPaneRatio * 100}%;`}
		>
			{#if currentLesson.mode === 'quiz'}
				<div
					class="min-h-0 flex-1 lg:h-full lg:flex-none lg:shrink-0 lg:basis-[var(--kk-lesson-pane-width)]"
				>
					<LessonReaderPane lesson={currentLesson} />
				</div>

				<div
					role="separator"
					aria-label="Resize lesson and quiz panes"
					aria-orientation="vertical"
					class="group relative z-20 hidden w-3 shrink-0 cursor-col-resize bg-[rgba(12,16,25,0.92)] lg:block"
					onpointerdown={startHorizontalResize}
				>
					<div
						class="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 bg-[rgba(255,214,236,0.16)] transition group-hover:bg-[var(--kk-highlight)]"
					></div>
					<div
						class="absolute top-1/2 left-1/2 h-16 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(255,214,236,0.12)] bg-[rgba(34,23,38,0.96)] transition group-hover:border-[var(--kk-highlight)]"
					></div>
				</div>

				<div class="min-h-0 flex-1 lg:h-full lg:min-w-0">
					<QuizLessonWorkspace
						lesson={currentLesson}
						{selectedChoiceId}
						submitting={running === 'submit'}
						onSelectChoice={(choiceId) => (selectedChoiceId = choiceId)}
						onSubmit={() => void submitCurrentLesson()}
					/>
				</div>
			{:else}
				<div
					class="min-h-0 flex-1 lg:h-full lg:flex-none lg:shrink-0 lg:basis-[var(--kk-lesson-pane-width)]"
				>
					<LessonReaderPane lesson={currentLesson} />
				</div>

				<div
					role="separator"
					aria-label="Resize lesson and coding panes"
					aria-orientation="vertical"
					class="group relative z-20 hidden w-3 shrink-0 cursor-col-resize bg-[rgba(12,16,25,0.92)] lg:block"
					onpointerdown={startHorizontalResize}
				>
					<div
						class="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 bg-[rgba(255,214,236,0.16)] transition group-hover:bg-[var(--kk-highlight)]"
					></div>
					<div
						class="absolute top-1/2 left-1/2 h-16 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(255,214,236,0.12)] bg-[rgba(34,23,38,0.96)] transition group-hover:border-[var(--kk-highlight)]"
					></div>
				</div>

				<div class="min-h-0 flex-1 lg:h-full lg:min-w-0">
					<CodingLessonWorkspace
						lesson={currentLesson}
						{editorValue}
						{vimModeEnabled}
						{running}
						{terminalOutput}
						{result}
						onValueChange={handleCodeChange}
						onRun={() => void runCodingLesson()}
						onSubmit={() => void submitCurrentLesson()}
					/>
				</div>
			{/if}
		</div>
	</div>
</div>

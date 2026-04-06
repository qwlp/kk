<script lang="ts">
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import { untrack } from 'svelte';
	import { onMount } from 'svelte';
	import type { PublicChallenge, RunIntent, SubmissionRunResponse } from '$lib/types';
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

	let { data }: { data: PageData } = $props();

	const challengeOptions = untrack(() => data.challenges);
	const initialChallenge = untrack(() => data.initialChallenge);

	let selectedSlug = $state(initialChallenge.slug);
	let selectedChallenge = $state<PublicChallenge>(initialChallenge);
	let code = $state(initialChallenge.starterCode);
	let stdin = $state('');
	let result = $state<SubmissionRunResponse | null>(null);
	let loadingChallenge = $state(false);
	let running = $state<RunIntent | null>(null);
	let submissionError = $state<string | null>(null);
	let showSolution = $state(false);
	let settingsOpen = $state(false);
	let vimModeEnabled = $state(false);
	let activeEditorFile = $state<'main' | 'test'>('main');
	let completedLessons = $state<string[]>([]);
	let confettiPieces = $state<ConfettiPiece[]>([]);
	let edgeFlashTone = $state<'error' | null>(null);
	let toasts = $state<Toast[]>([]);

	let challengeDrafts = $state<Record<string, { code: string; stdin: string }>>({
		[initialChallenge.slug]: { code: initialChallenge.starterCode, stdin: '' }
	});

	const progressSteps = $derived.by(() => challengeOptions);

	const terminalOutput = $derived.by(() => {
		if (submissionError) return submissionError;
		if (!result) return '';
		if (result.stdout.trim().length > 0) return result.stdout.trimEnd();
		if (result.stderr.trim().length > 0) return result.stderr.trimEnd();
		const firstIssue = result.tests.find((test) => test.status !== 'passed')?.message;
		if (firstIssue) return firstIssue;
		return result.status === 'passed'
			? `Passed in ${result.durationMs} ms`
			: `${result.status.toUpperCase()} in ${result.durationMs} ms`;
	});

	const isViewingTestFile = $derived.by(
		() =>
			selectedChallenge.mode === 'function' &&
			!!selectedChallenge.testFileContent &&
			activeEditorFile === 'test'
	);

	const editorValue = $derived.by(() =>
		isViewingTestFile ? (selectedChallenge.testFileContent ?? '') : code
	);

	const editorReadOnly = $derived.by(() => showSolution || isViewingTestFile);

	onMount(() => {
		if (!browser) return;

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
	});

	$effect(() => {
		if (!browser) return;
		window.localStorage.setItem('kk-editor-vim-mode', String(vimModeEnabled));
	});

	$effect(() => {
		if (!browser) return;
		window.localStorage.setItem('kk-completed-lessons', JSON.stringify(completedLessons));
	});

	async function loadChallenge(slug: string) {
		if (slug === selectedChallenge.slug) return;

		challengeDrafts[selectedChallenge.slug] = { code, stdin };
		loadingChallenge = true;
		submissionError = null;
		result = null;
		showSolution = false;
		activeEditorFile = 'main';

		try {
			const response = await fetch(`/api/challenges/${slug}`);
			const payload = await response.json();

			if (!response.ok) {
				submissionError = payload?.message ?? 'Could not load that challenge.';
				selectedSlug = selectedChallenge.slug;
				return;
			}

			selectedChallenge = payload.challenge satisfies PublicChallenge;
			const existingDraft = challengeDrafts[slug];
			code = existingDraft?.code ?? payload.challenge.starterCode;
			stdin = existingDraft?.stdin ?? '';
		} catch (errorValue) {
			submissionError =
				errorValue instanceof Error ? errorValue.message : 'Could not load that challenge.';
			selectedSlug = selectedChallenge.slug;
		} finally {
			loadingChallenge = false;
		}
	}

	async function runCode(intent: RunIntent) {
		running = intent;
		submissionError = null;
		result = null;
		challengeDrafts[selectedChallenge.slug] = { code, stdin };

		try {
			const response = await fetch('/api/submissions/run', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					challengeSlug: selectedChallenge.slug,
					code,
					intent,
					stdin: selectedChallenge.mode === 'stdin' ? stdin : undefined
				})
			});

			const payload = await response.json();

			if (!response.ok) {
				submissionError = payload?.message ?? 'The runner could not process this submission.';
				return;
			}

			result = payload satisfies SubmissionRunResponse;

			if (intent === 'submit') {
				if (payload.status === 'passed') {
					const wasCompleted = completedLessons.includes(selectedChallenge.slug);
					if (!wasCompleted) {
						completedLessons = [...completedLessons, selectedChallenge.slug];
					}
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
			}
		} catch (errorValue) {
			submissionError =
				errorValue instanceof Error
					? errorValue.message
					: 'The runner could not process this submission.';

			if (intent === 'submit') {
				triggerFailureFlash();
				pushToast({
					tone: 'error',
					title: 'Submission failed',
					message: submissionError,
					durationMs: 2600
				});
			}
		} finally {
			running = null;
		}
	}

	function toggleSolution() {
		if (showSolution) {
			const draft = challengeDrafts[selectedChallenge.slug];
			code = draft?.code ?? selectedChallenge.starterCode;
			stdin = draft?.stdin ?? '';
			showSolution = false;
			activeEditorFile = 'main';
			return;
		}

		challengeDrafts[selectedChallenge.slug] = { code, stdin };
		code = selectedChallenge.solutionCode;
		showSolution = true;
		result = null;
		submissionError = null;
		activeEditorFile = 'main';
	}

	function handleCodeChange(nextValue: string) {
		code = nextValue;
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
</script>

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
		<header
			class="border-b border-[var(--kk-border)] bg-[linear-gradient(180deg,rgba(31,19,31,0.94),rgba(20,13,23,0.94))] shadow-[0_10px_40px_rgba(0,0,0,0.28)] backdrop-blur"
		>
			<div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
				<div class="hidden flex-1 items-center justify-center gap-2 xl:flex">
					{#each progressSteps as challenge (challenge.slug)}
						<span
							class={`h-3 w-3 rounded-full border transition ${
								completedLessons.includes(challenge.slug)
									? 'gold-orb border-[#ffd15c]/20 opacity-100'
									: challenge.slug === selectedSlug
										? 'border-[#9fa8bf] bg-[#32384a] opacity-100'
										: 'border-[#7d7454]/18 bg-[#5a5340] opacity-45'
							}`}
						></span>
					{/each}
				</div>

				<div class="ml-auto flex min-w-0 items-center gap-3">
					<div class="relative">
						<button
							type="button"
							onclick={() => (settingsOpen = !settingsOpen)}
							class="rounded-md border border-[var(--kk-border)] bg-[var(--kk-panel-2)] px-4 py-2 text-sm text-[var(--kk-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition hover:bg-[var(--kk-panel-3)]"
							aria-expanded={settingsOpen}
							aria-haspopup="true"
						>
							Settings
						</button>

						{#if settingsOpen}
							<div
								class="absolute top-[calc(100%+0.75rem)] right-0 z-20 w-64 rounded-2xl border border-[var(--kk-border)] bg-[rgba(27,20,31,0.98)] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.44)] backdrop-blur"
							>
								<div class="flex items-start justify-between gap-3">
									<div>
										<p
											class="font-mono text-xs font-semibold tracking-[0.22em] text-[var(--kk-text-dim)] uppercase"
										>
											Editor Settings
										</p>
										<p class="mt-1 font-mono text-xs leading-6 text-[var(--kk-text-soft)]">
											Customize the coding experience for this browser.
										</p>
									</div>
									<button
										type="button"
										onclick={() => (settingsOpen = false)}
										class="text-sm text-[var(--kk-text-dim)] transition hover:text-white"
										aria-label="Close settings"
									>
										✕
									</button>
								</div>

								<label
									class="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[var(--kk-border)] bg-[var(--kk-panel-2)] px-4 py-3"
								>
									<div>
										<p class="font-mono text-sm text-[var(--kk-text)]">Vim mode</p>
										<p class="mt-1 font-mono text-xs leading-6 text-[var(--kk-text-soft)]">
											Enable modal editing and Vim keybindings in the editor.
										</p>
									</div>
									<input
										bind:checked={vimModeEnabled}
										type="checkbox"
										class="h-4 w-4 rounded border-white/20 bg-[#120d14] text-[var(--kk-accent)] focus:ring-[var(--kk-accent)]"
									/>
								</label>
							</div>
						{/if}
					</div>
					<div class="hidden gap-3 md:flex">
						<div
							class="min-w-52 rounded-md border border-[var(--kk-border)] bg-[var(--kk-panel-2)] px-4 py-2 text-sm text-[var(--kk-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
						>
							CH1: Python Foundations
						</div>
						<select
							bind:value={selectedSlug}
							onchange={(event) => loadChallenge((event.currentTarget as HTMLSelectElement).value)}
							class="min-w-72 rounded-md border border-[var(--kk-border)] bg-[var(--kk-panel-2)] px-4 py-2 text-sm text-[var(--kk-text)] transition outline-none focus:border-[var(--kk-accent)]"
						>
							{#each challengeOptions as challenge (challenge.slug)}
								<option value={challenge.slug}>
									L{challengeOptions.findIndex((item) => item.slug === challenge.slug) + 1}: {challenge.title}
								</option>
							{/each}
						</select>
					</div>
					<a
						href={resolve('/')}
						class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[linear-gradient(180deg,var(--kk-highlight),var(--kk-accent-2))] text-xl text-[#ffe8f2] shadow-[0_0_25px_var(--kk-accent-glow)] transition hover:brightness-110"
						aria-label="Go back"
					>
						&rarr;
					</a>
				</div>
			</div>
		</header>

		<div class="flex min-h-0 flex-1 flex-col lg:flex-row">
			<section
				class="stone-panel flex min-h-0 flex-1 flex-col border-b border-white/8 lg:w-1/2 lg:border-r lg:border-b-0"
			>
				<div class="flex-1 overflow-y-auto px-5 pt-5 pb-10 md:px-6">
					<article
						class="lesson-markdown prose max-w-none prose-invert prose-headings:font-[Georgia,'Times_New_Roman',serif] prose-headings:tracking-tight prose-headings:text-[var(--kk-text)] prose-h1:mt-0 prose-h1:mb-5 prose-h1:text-[2.8rem] prose-h2:mt-10 prose-h2:text-[2rem] prose-p:font-mono prose-p:text-[1.02rem] prose-p:leading-8 prose-p:text-[var(--kk-text-soft)] prose-a:text-[var(--kk-highlight)] prose-blockquote:border-l-4 prose-blockquote:border-[var(--kk-highlight)] prose-blockquote:bg-[rgba(29,20,33,0.95)] prose-blockquote:py-4 prose-blockquote:pr-4 prose-blockquote:pl-5 prose-blockquote:font-mono prose-blockquote:text-[var(--kk-text)] prose-strong:text-[var(--kk-text)] prose-code:rounded prose-code:bg-[var(--kk-panel-3)] prose-code:px-2 prose-code:py-1 prose-code:text-[var(--kk-text)] prose-code:before:content-none prose-code:after:content-none prose-pre:border-0 prose-pre:bg-[rgba(18,13,22,0.96)] prose-pre:px-5 prose-pre:py-5 prose-ol:my-5 prose-ul:my-5 prose-li:font-mono prose-li:text-[1rem] prose-li:leading-8 prose-li:text-[var(--kk-text-soft)]"
					>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html selectedChallenge.lessonHtml}
					</article>
				</div>
			</section>

			<section class="stone-panel flex min-h-0 flex-1 flex-col lg:w-1/2">
				<div class="flex min-h-0 flex-1 flex-col">
					{#if selectedChallenge.mode === 'function' && selectedChallenge.testFileContent}
						<div class="flex items-center gap-2 border-b border-white/8 bg-[#151b27]/92 px-4 pt-2">
							<button
								type="button"
								onclick={() => (activeEditorFile = 'main')}
								class={`rounded-t-xl border border-b-0 px-4 py-2 font-mono text-xs transition ${
									activeEditorFile === 'main'
										? 'border-[var(--kk-border)] bg-[var(--kk-panel-2)] text-[var(--kk-text)]'
										: 'border-transparent text-[var(--kk-text-dim)] hover:text-[var(--kk-text)]'
								}`}
							>
								main.py
							</button>
							<button
								type="button"
								onclick={() => (activeEditorFile = 'test')}
								class={`rounded-t-xl border border-b-0 px-4 py-2 font-mono text-xs transition ${
									activeEditorFile === 'test'
										? 'border-[var(--kk-border)] bg-[var(--kk-panel-2)] text-[var(--kk-text)]'
										: 'border-transparent text-[var(--kk-text-dim)] hover:text-[var(--kk-text)]'
								}`}
							>
								{selectedChallenge.testFileName ?? 'main_test.py'}
							</button>
						</div>
					{/if}

					<div class="code-surface relative min-h-0 flex-1 bg-[rgba(27,20,31,0.98)]">
						<CodeEditor
							value={editorValue}
							readOnly={editorReadOnly}
							vimMode={vimModeEnabled}
							onValueChange={handleCodeChange}
						/>
						<div
							class="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(12,16,25,0.12),transparent)]"
						></div>
					</div>

					<div class="border-t border-[var(--kk-border)] bg-[rgba(27,20,31,0.98)]">
						{#if selectedChallenge.mode === 'stdin'}
							<div class="border-b border-[var(--kk-border)] px-4 py-3">
								<label
									for="stdin"
									class="mb-2 block font-mono text-xs font-semibold tracking-[0.22em] text-[var(--kk-text-dim)] uppercase"
								>
									Sample stdin
								</label>
								<textarea
									id="stdin"
									bind:value={stdin}
									spellcheck="false"
									class="h-20 w-full rounded-xl border border-[var(--kk-border)] bg-[rgba(35,24,39,0.96)] px-3 py-2 font-mono text-sm leading-6 text-[var(--kk-text)] transition outline-none focus:border-[var(--kk-accent)]"
								></textarea>
							</div>
						{/if}

						<div class="flex flex-wrap items-center gap-3 px-4 py-3">
							<div class="flex flex-wrap items-center gap-3">
								<button
									type="button"
									onclick={() => runCode('submit')}
									disabled={running !== null || loadingChallenge || isViewingTestFile}
									class="rounded-full border border-[rgba(255,214,236,0.1)] bg-[linear-gradient(180deg,var(--kk-highlight),var(--kk-accent-2))] px-5 py-2 font-mono text-[0.97rem] font-semibold text-[#ffe8f2] shadow-[0_6px_20px_rgba(0,0,0,0.28)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
								>
									▶ {running === 'submit' ? 'Submitting...' : 'Submit'}
								</button>
								<button
									type="button"
									onclick={() => runCode('run')}
									disabled={running !== null || loadingChallenge || isViewingTestFile}
									class="rounded-full border border-[var(--kk-border)] bg-[var(--kk-panel-3)] px-5 py-2 font-mono text-[0.97rem] font-semibold text-[var(--kk-text)] shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition hover:border-[var(--kk-border-strong)] hover:bg-[rgba(55,33,54,0.95)] disabled:cursor-not-allowed disabled:opacity-60"
								>
									▶ {running === 'run' ? 'Running...' : 'Run'}
								</button>
								<button
									type="button"
									onclick={toggleSolution}
									class="rounded-full border border-[var(--kk-border)] bg-[var(--kk-panel-3)] px-5 py-2 font-mono text-[0.97rem] font-semibold text-[var(--kk-text)] shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition hover:border-[var(--kk-border-strong)] hover:bg-[rgba(55,33,54,0.95)]"
								>
									👁 {showSolution ? 'Starter' : 'Solution'}
								</button>
							</div>
						</div>

						<div
							class="min-h-52 border-t border-[var(--kk-border)] bg-[rgba(27,20,31,0.98)] px-5 py-6"
						>
							<pre
								class="font-mono text-sm leading-8 whitespace-pre-wrap text-[var(--kk-text-soft)]">{terminalOutput ||
									'\u00a0'}</pre>
							{#if result && result.stderr.trim().length > 0 && result.stdout.trim().length > 0}
								<pre
									class="mt-4 max-h-40 overflow-auto font-mono text-sm leading-8 whitespace-pre-wrap text-rose-200">{result.stderr.trimEnd()}</pre>
							{/if}
						</div>
					</div>
				</div>
			</section>
		</div>
	</div>
</div>

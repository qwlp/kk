<script lang="ts">
	import { browser } from '$app/environment';
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import { onMount } from 'svelte';
	import type {
		ConsoleLesson,
		LessonRunResponse,
		LessonSubmitResponse,
		RunIntent,
		UnitLesson
	} from '$lib/types';

	type VerticalResizeState = {
		pointerId: number;
	};

	type EditorFile = 'main.py' | 'main_test.py';

	interface Props {
		lesson: ConsoleLesson | UnitLesson;
		editorValue: string;
		vimModeEnabled: boolean;
		running: RunIntent | null;
		terminalOutput: string;
		result: LessonRunResponse | LessonSubmitResponse | null;
		onValueChange: (value: string) => void;
		onRun: () => void;
		onSubmit: () => void;
	}

	let {
		lesson,
		editorValue,
		vimModeEnabled,
		running,
		terminalOutput,
		result,
		onValueChange,
		onRun,
		onSubmit
	}: Props = $props();

	let workspacePaneElement = $state<HTMLDivElement | null>(null);
	let terminalPaneRatio = $state(0.32);
	let verticalResizeState = $state<VerticalResizeState | null>(null);
	let activeEditorFile = $state<EditorFile>('main.py');

	const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
	const normalizeUnitTestFileName = (value: string | null | undefined) => {
		const trimmed = value?.trim() ?? '';
		return trimmed.length > 0 ? trimmed : 'main_test.py';
	};
	const normalizeUnitTestFileContent = (value: string | null | undefined) => {
		const content = value ?? '';
		if (content.trim().length > 0) {
			return content;
		}

		return [
			'from main import *',
			'',
			'# Test file unavailable for this lesson.',
			'# Run and Submit still use the lesson test cases.'
		].join('\n');
	};

	const unitTestFileName = $derived.by(() =>
		lesson.mode === 'unit' ? normalizeUnitTestFileName(lesson.testFileName) : 'main_test.py'
	);
	const unitTestFileContent = $derived.by(() =>
		lesson.mode === 'unit' ? normalizeUnitTestFileContent(lesson.testFileContent) : ''
	);

	const editorFileItems = $derived.by(() => {
		if (lesson.mode !== 'unit') {
			return [{ id: 'main.py' as const, label: 'main.py', readOnly: false }];
		}

		return [
			{ id: 'main.py' as const, label: 'main.py', readOnly: false },
			{
				id: 'main_test.py' as const,
				label: unitTestFileName,
				readOnly: true
			}
		];
	});

	const activeEditorValue = $derived.by(() => {
		if (lesson.mode === 'unit' && activeEditorFile === 'main_test.py') {
			return unitTestFileContent;
		}

		return editorValue;
	});

	const activeEditorReadOnly = $derived.by(
		() => lesson.mode === 'unit' && activeEditorFile === 'main_test.py'
	);

	const getEditorTabClass = (isActive: boolean) =>
		[
			'rounded-full border px-3 py-1 font-mono text-xs font-semibold tracking-[0.12em] uppercase transition',
			isActive
				? 'border-[var(--kk-highlight)] bg-[rgba(217,79,139,0.16)] text-[var(--kk-text)]'
				: 'border-[rgba(255,214,236,0.08)] bg-transparent text-[var(--kk-text-dim)]'
		].join(' ');

	onMount(() => {
		if (!browser) return;

		const storedTerminalPaneRatio = window.localStorage.getItem('kk-terminal-pane-ratio');
		if (!storedTerminalPaneRatio) return;

		const parsed = Number.parseFloat(storedTerminalPaneRatio);
		if (Number.isFinite(parsed)) {
			terminalPaneRatio = clamp(parsed, 0.2, 0.6);
		}
	});

	$effect(() => {
		if (!browser) return;
		window.localStorage.setItem('kk-terminal-pane-ratio', String(terminalPaneRatio));
	});

	$effect(() => {
		void lesson.slug;
		activeEditorFile = 'main.py';
	});

	function startVerticalResize(event: PointerEvent) {
		if (!workspacePaneElement) return;

		event.preventDefault();
		(event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId);
		verticalResizeState = {
			pointerId: event.pointerId
		};
	}

	function handleWindowPointerMove(event: PointerEvent) {
		if (!verticalResizeState || event.pointerId !== verticalResizeState.pointerId) return;
		if (!workspacePaneElement) return;

		const bounds = workspacePaneElement.getBoundingClientRect();
		if (bounds.height <= 0) return;

		const nextRatio = clamp((bounds.bottom - event.clientY) / bounds.height, 0.2, 0.6);
		terminalPaneRatio = nextRatio;
	}

	function stopVerticalResize(event: PointerEvent) {
		if (!verticalResizeState || event.pointerId !== verticalResizeState.pointerId) return;

		verticalResizeState = null;
	}
</script>

<svelte:window
	onpointermove={handleWindowPointerMove}
	onpointerup={stopVerticalResize}
	onpointercancel={stopVerticalResize}
/>

<section class="stone-panel flex h-full min-h-0 w-full flex-1 flex-col">
	<div
		bind:this={workspacePaneElement}
		class="flex min-h-0 flex-1 flex-col"
		class:select-none={verticalResizeState !== null}
		style={`--kk-terminal-pane-height:${terminalPaneRatio * 100}%;`}
	>
		<div class="flex min-h-0 flex-1 flex-col">
			{#if lesson.mode === 'console' && lesson.sampleInput}
				<div class="border-b border-white/8 bg-transparent px-4 py-3">
					<p
						class="font-mono text-xs font-semibold tracking-[0.22em] text-[var(--kk-text-dim)] uppercase"
					>
						Sample Input
					</p>
					<pre
						class="mt-2 font-mono text-sm leading-7 whitespace-pre-wrap text-[var(--kk-text-soft)]">{lesson.sampleInput}</pre>
				</div>
			{/if}

			<div class="relative min-h-0 flex-1 bg-transparent">
				<div class="flex items-center justify-between border-b border-white/8 px-3 py-2">
					<div class="flex flex-wrap items-center gap-2">
						{#each editorFileItems as file (file.id)}
							<button
								type="button"
								class={getEditorTabClass(activeEditorFile === file.id)}
								onclick={() => {
									activeEditorFile = file.id;
								}}
							>
								{file.label}
							</button>
						{/each}
					</div>

					{#if lesson.mode === 'unit' && activeEditorReadOnly}
						<p
							class="font-mono text-[0.72rem] tracking-[0.14em] text-[var(--kk-text-dim)] uppercase"
						>
							Read Only Test File
						</p>
					{/if}
				</div>

				<CodeEditor
					value={activeEditorValue}
					readOnly={activeEditorReadOnly}
					vimMode={vimModeEnabled}
					{onValueChange}
				/>
				<div
					class="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]"
				></div>
			</div>
		</div>

		<div
			role="separator"
			aria-label="Resize editor and terminal panes"
			aria-orientation="horizontal"
			class="group relative h-3 shrink-0 cursor-row-resize bg-transparent"
			onpointerdown={startVerticalResize}
		>
			<div
				class="pointer-events-none absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-[rgba(255,214,236,0.16)] transition group-hover:bg-[var(--kk-highlight)]"
			></div>
			<div
				class="pointer-events-none absolute top-1/2 left-1/2 h-7 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(255,214,236,0.12)] bg-[rgba(34,23,38,0.96)] transition group-hover:border-[var(--kk-highlight)]"
			></div>
		</div>

		<div
			class="flex min-h-0 shrink-0 basis-[var(--kk-terminal-pane-height)] flex-col border-t border-[var(--kk-border)] bg-transparent"
		>
			<div class="flex flex-wrap items-center gap-3 px-4 py-3">
				<div class="flex flex-wrap items-center gap-3">
					<button
						type="button"
						onclick={onSubmit}
						disabled={running !== null}
						class="appearance-none rounded-full border-0 bg-[#d94f8b] px-5 py-2 font-mono text-[0.97rem] font-semibold text-[#fff0f6] shadow-none transition hover:bg-[#c8437d] disabled:cursor-not-allowed disabled:opacity-60"
					>
						▶ {running === 'submit' ? 'Submitting...' : 'Submit'}
					</button>
					<button
						type="button"
						onclick={onRun}
						disabled={running !== null}
						class="rounded-full border border-[var(--kk-border)] bg-[var(--kk-panel-3)] px-5 py-2 font-mono text-[0.97rem] font-semibold text-[var(--kk-text)] shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition hover:border-[var(--kk-border-strong)] hover:bg-[rgba(55,33,54,0.95)] disabled:cursor-not-allowed disabled:opacity-60"
					>
						▶ {running === 'run' ? 'Running...' : 'Run'}
					</button>
				</div>
			</div>

			<div
				class="min-h-0 flex-1 overflow-auto border-t border-[var(--kk-border)] bg-transparent px-5 py-6"
			>
				<pre
					class="font-mono text-sm leading-8 whitespace-pre-wrap text-[var(--kk-text-soft)]">{terminalOutput ||
						'\u00a0'}</pre>
				{#if result && result.stderr && result.stderr.trim().length > 0 && result.stdout && result.stdout.trim().length > 0}
					<pre
						class="mt-4 max-h-40 overflow-auto font-mono text-sm leading-8 whitespace-pre-wrap text-rose-200">{result.stderr.trimEnd()}</pre>
				{/if}
			</div>
		</div>
	</div>
</section>

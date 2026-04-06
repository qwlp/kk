<script lang="ts">
	import type { ChapterSummary, CourseSequenceItem, LessonSummary, PublicLesson } from '$lib/types';

	interface Props {
		chapters: ChapterSummary[];
		currentChapter: ChapterSummary;
		lessonsInChapter: LessonSummary[];
		completedLessonSlugs: string[];
		currentLesson: PublicLesson;
		previousLesson: CourseSequenceItem | null;
		nextLesson: CourseSequenceItem | null;
		vimModeEnabled: boolean;
		showSettings: boolean;
		onToggleVim: () => void;
		onChapterSelect: (chapterSlug: string) => void;
		onLessonSelect: (lessonSlug: string) => void;
		onNavigateLesson: (lesson: CourseSequenceItem | null) => void;
	}

	let {
		chapters,
		currentChapter,
		lessonsInChapter,
		completedLessonSlugs,
		currentLesson,
		previousLesson,
		nextLesson,
		vimModeEnabled,
		showSettings,
		onToggleVim,
		onChapterSelect,
		onLessonSelect,
		onNavigateLesson
	}: Props = $props();

	let settingsOpen = $state(false);
	let settingsButtonElement = $state<HTMLButtonElement | null>(null);
	let settingsPanelElement = $state<HTMLDivElement | null>(null);

	const completedLessonSlugSet = $derived.by(() => new Set(completedLessonSlugs));

	$effect(() => {
		if (!showSettings) {
			settingsOpen = false;
		}
	});

	function handleWindowPointerDown(event: PointerEvent) {
		if (!settingsOpen) return;
		const target = event.target;
		if (!(target instanceof Node)) return;
		if (settingsButtonElement?.contains(target) || settingsPanelElement?.contains(target)) return;
		settingsOpen = false;
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			settingsOpen = false;
		}
	}
</script>

<svelte:window onpointerdown={handleWindowPointerDown} onkeydown={handleWindowKeydown} />

<header
	class="relative z-20 overflow-visible border-b border-[var(--kk-border)] bg-[linear-gradient(180deg,rgba(31,19,31,0.94),rgba(20,13,23,0.94))] shadow-[0_10px_40px_rgba(0,0,0,0.28)] backdrop-blur"
>
	<div class="flex flex-wrap items-center gap-3 overflow-visible px-4 py-3">
		<div class="flex shrink-0 items-center gap-3">
			{#if showSettings}
				<div class="relative shrink-0">
					<button
						bind:this={settingsButtonElement}
						type="button"
						onclick={() => (settingsOpen = !settingsOpen)}
						class="topbar-card topbar-button"
						aria-expanded={settingsOpen}
						aria-haspopup="true"
					>
						<span class="topbar-button-icon" aria-hidden="true">
							<svg viewBox="0 0 24 24" class="h-4 w-4">
								<path
									d="M6 7h12M6 12h12M6 17h12M9 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm9 5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm-4 5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
									fill="none"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.7"
								/>
							</svg>
						</span>
						<span class="font-mono text-[0.98rem] tracking-[0.02em]">Settings</span>
					</button>

					{#if settingsOpen}
						<div
							bind:this={settingsPanelElement}
							class="absolute top-[calc(100%+0.75rem)] left-0 z-20 w-44 rounded-2xl border border-[var(--kk-border)] bg-[rgba(27,20,31,0.98)] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.44)] backdrop-blur"
						>
							<label
								class="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[var(--kk-border)] bg-[var(--kk-panel-2)] px-3 py-2.5"
							>
								<span class="font-mono text-sm text-[var(--kk-text)]">Vim</span>
								<button
									type="button"
									role="switch"
									aria-checked={vimModeEnabled}
									aria-label="Toggle Vim mode"
									onclick={(event) => {
										event.preventDefault();
										onToggleVim();
										settingsOpen = false;
									}}
									class={`relative h-7 w-12 rounded-full border transition ${
										vimModeEnabled
											? 'border-[var(--kk-accent)] bg-[rgba(223,79,143,0.28)]'
											: 'border-[var(--kk-border)] bg-[rgba(255,255,255,0.04)]'
									}`}
								>
									<span
										class={`absolute top-1 h-4 w-4 rounded-full bg-[var(--kk-text)] transition ${
											vimModeEnabled ? 'left-6' : 'left-1'
										}`}
									></span>
								</button>
							</label>
						</div>
					{/if}
				</div>
			{/if}

			<div
				class="topbar-card topbar-progress-shell hidden md:flex"
				aria-label={`Chapter progress: ${completedLessonSlugs.filter((slug) => lessonsInChapter.some((lesson) => lesson.slug === slug)).length} of ${lessonsInChapter.length} lessons completed`}
			>
				<div class="topbar-progress-grid" aria-hidden="true">
					{#each lessonsInChapter as lesson (lesson.slug)}
						<button
							type="button"
							onclick={() => onLessonSelect(lesson.slug)}
							class={`topbar-progress-dot ${
								completedLessonSlugSet.has(lesson.slug)
									? 'topbar-progress-dot-complete'
									: 'topbar-progress-dot-pending'
							} ${currentLesson.slug === lesson.slug ? 'topbar-progress-dot-current' : ''}`}
							title={`Lesson ${lesson.order}: ${lesson.title}${completedLessonSlugSet.has(lesson.slug) ? ' completed' : ' not completed'}`}
							aria-label={`Go to lesson ${lesson.order}: ${lesson.title}`}
							aria-current={currentLesson.slug === lesson.slug ? 'page' : undefined}
						></button>
					{/each}
				</div>
			</div>
		</div>

		<div class="ml-auto flex min-w-0 items-center gap-3">
			<div class="hidden min-w-0 items-center gap-3 md:flex">
				<div class="topbar-card topbar-chip">
					<select
						value={currentChapter.slug}
						onchange={(event) => onChapterSelect((event.currentTarget as HTMLSelectElement).value)}
						class="topbar-select"
						aria-label="Select chapter"
					>
						{#each chapters as chapter (chapter.slug)}
							<option value={chapter.slug}>CH{chapter.order}: {chapter.title}</option>
						{/each}
					</select>
					<span class="topbar-select-chevron" aria-hidden="true">
						<svg viewBox="0 0 24 24" class="h-4 w-4">
							<path
								d="m7 10 5 5 5-5"
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.8"
							/>
						</svg>
					</span>
				</div>

				<div class="topbar-card topbar-select-shell relative">
					<select
						value={currentLesson.slug}
						onchange={(event) => onLessonSelect((event.currentTarget as HTMLSelectElement).value)}
						class="topbar-select"
						aria-label="Select lesson"
					>
						{#each lessonsInChapter as lesson (lesson.slug)}
							<option value={lesson.slug}>L{lesson.order}: {lesson.title}</option>
						{/each}
					</select>
					<span class="topbar-select-chevron" aria-hidden="true">
						<svg viewBox="0 0 24 24" class="h-4 w-4">
							<path
								d="m7 10 5 5 5-5"
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.8"
							/>
						</svg>
					</span>
				</div>
			</div>

			<div class="topbar-card topbar-nav flex shrink-0 items-center gap-1.5 rounded-full">
				<button
					type="button"
					onclick={() => onNavigateLesson(previousLesson)}
					class="topbar-nav-button"
					aria-label={previousLesson
						? `Go to previous lesson: ${previousLesson.title}`
						: 'No previous lesson'}
					title={previousLesson ? previousLesson.title : 'First lesson'}
					disabled={!previousLesson}
				>
					<svg viewBox="0 0 24 24" class="h-5 w-5" aria-hidden="true">
						<path
							d="M14.5 5.5 8 12l6.5 6.5M18 12H8.5"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.9"
						/>
					</svg>
				</button>

				<div
					class="rounded-full border border-[rgba(255,214,236,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-2 font-mono text-[0.72rem] tracking-[0.22em] text-[var(--kk-text-soft)] md:hidden"
				>
					L{currentLesson.order}/{currentChapter.lessonCount}
				</div>

				<button
					type="button"
					onclick={() => onNavigateLesson(nextLesson)}
					class="topbar-nav-button topbar-nav-button-accent"
					aria-label={nextLesson ? `Go to next lesson: ${nextLesson.title}` : 'No next lesson'}
					title={nextLesson ? nextLesson.title : 'Last lesson'}
					disabled={!nextLesson}
				>
					<svg viewBox="0 0 24 24" class="h-5 w-5" aria-hidden="true">
						<path
							d="M9.5 5.5 16 12l-6.5 6.5M6 12h9.5"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.9"
						/>
					</svg>
				</button>
			</div>
		</div>
	</div>
</header>

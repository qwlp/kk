<script lang="ts">
	import type {
		ChapterLessonTargetMap,
		CourseSequenceItem,
		LessonNavigationTarget,
		ChapterSummary,
		LessonSummary,
		PublicLesson
	} from '$lib/types';

	interface Props {
		chapters: ChapterSummary[];
		chapterTargets: ChapterLessonTargetMap;
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
		onPrefetchLesson: (lesson: LessonNavigationTarget | null) => void;
	}

	let {
		chapters,
		chapterTargets,
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
		onNavigateLesson,
		onPrefetchLesson
	}: Props = $props();

	let settingsOpen = $state(false);
	let activeMenu = $state<'chapter' | 'lesson' | null>(null);
	let settingsButtonElement = $state<HTMLButtonElement | null>(null);
	let settingsPanelElement = $state<HTMLDivElement | null>(null);
	let chapterButtonElement = $state<HTMLButtonElement | null>(null);
	let chapterPanelElement = $state<HTMLDivElement | null>(null);
	let lessonButtonElement = $state<HTMLButtonElement | null>(null);
	let lessonPanelElement = $state<HTMLDivElement | null>(null);

	const completedLessonSlugSet = $derived.by(() => new Set(completedLessonSlugs));

	$effect(() => {
		if (!showSettings) {
			settingsOpen = false;
		}
	});

	function isWithinPopover(
		target: Node,
		button: HTMLButtonElement | null,
		panel: HTMLDivElement | null
	) {
		return button?.contains(target) || panel?.contains(target);
	}

	function toggleMenu(menu: 'chapter' | 'lesson') {
		settingsOpen = false;
		activeMenu = activeMenu === menu ? null : menu;
	}

	function getLessonMeta(lesson: LessonSummary) {
		if (completedLessonSlugSet.has(lesson.slug)) return 'Completed';
		if (lesson.mode === 'quiz') return 'Quiz';
		if (lesson.mode === 'unit') return 'Practice';
		return 'Exercise';
	}

	function handleWindowPointerDown(event: PointerEvent) {
		const target = event.target;
		if (!(target instanceof Node)) return;

		if (settingsOpen && !isWithinPopover(target, settingsButtonElement, settingsPanelElement)) {
			settingsOpen = false;
		}

		if (
			activeMenu === 'chapter' &&
			!isWithinPopover(target, chapterButtonElement, chapterPanelElement)
		) {
			activeMenu = null;
		}

		if (
			activeMenu === 'lesson' &&
			!isWithinPopover(target, lessonButtonElement, lessonPanelElement)
		) {
			activeMenu = null;
		}
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			settingsOpen = false;
			activeMenu = null;
		}
	}

	const toCurrentChapterLessonTarget = (lessonSlug: string): LessonNavigationTarget => ({
		chapterSlug: currentChapter.slug,
		lessonSlug
	});
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
						onclick={() => {
							activeMenu = null;
							settingsOpen = !settingsOpen;
						}}
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
							onpointerenter={() => onPrefetchLesson(toCurrentChapterLessonTarget(lesson.slug))}
							onfocus={() => onPrefetchLesson(toCurrentChapterLessonTarget(lesson.slug))}
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
				<div class="topbar-card topbar-menu-shell topbar-chip">
					<button
						bind:this={chapterButtonElement}
						type="button"
						class={`topbar-trigger ${activeMenu === 'chapter' ? 'topbar-trigger-open' : ''}`}
						aria-expanded={activeMenu === 'chapter'}
						aria-haspopup="true"
						aria-label="Select chapter"
						onclick={() => toggleMenu('chapter')}
					>
						<span class="topbar-trigger-prefix">CH{currentChapter.order}</span>
						<span class="topbar-trigger-label">{currentChapter.title}</span>
					</button>
					<span
						class={`topbar-select-chevron ${activeMenu === 'chapter' ? 'topbar-select-chevron-open' : ''}`}
						aria-hidden="true"
					>
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

					{#if activeMenu === 'chapter'}
						<div bind:this={chapterPanelElement} class="topbar-menu-panel left-0">
							<div class="topbar-menu-list" role="menu" aria-label="Chapters">
								{#each chapters as chapter (chapter.slug)}
									<button
										type="button"
										role="menuitemradio"
										aria-checked={currentChapter.slug === chapter.slug}
										class={`topbar-menu-option ${currentChapter.slug === chapter.slug ? 'topbar-menu-option-current' : ''}`}
										onpointerenter={() => onPrefetchLesson(chapterTargets[chapter.slug] ?? null)}
										onfocus={() => onPrefetchLesson(chapterTargets[chapter.slug] ?? null)}
										onclick={() => {
											activeMenu = null;
											onChapterSelect(chapter.slug);
										}}
									>
										<span class="topbar-menu-option-kicker">CH{chapter.order}</span>
										<span class="topbar-menu-option-copy">
											<span class="topbar-menu-option-title">{chapter.title}</span>
											<span class="topbar-menu-option-meta">
												{chapter.lessonCount} lessons
											</span>
										</span>
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<div class="topbar-card topbar-menu-shell topbar-select-shell">
					<button
						bind:this={lessonButtonElement}
						type="button"
						class={`topbar-trigger ${activeMenu === 'lesson' ? 'topbar-trigger-open' : ''}`}
						aria-expanded={activeMenu === 'lesson'}
						aria-haspopup="true"
						aria-label="Select lesson"
						onclick={() => toggleMenu('lesson')}
					>
						<span class="topbar-trigger-prefix">L{currentLesson.order}</span>
						<span class="topbar-trigger-label">{currentLesson.title}</span>
					</button>
					<span
						class={`topbar-select-chevron ${activeMenu === 'lesson' ? 'topbar-select-chevron-open' : ''}`}
						aria-hidden="true"
					>
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

					{#if activeMenu === 'lesson'}
						<div bind:this={lessonPanelElement} class="topbar-menu-panel right-0">
							<div class="topbar-menu-list" role="menu" aria-label="Lessons">
								{#each lessonsInChapter as lesson (lesson.slug)}
									<button
										type="button"
										role="menuitemradio"
										aria-checked={currentLesson.slug === lesson.slug}
										class={`topbar-menu-option ${currentLesson.slug === lesson.slug ? 'topbar-menu-option-current' : ''}`}
										onpointerenter={() =>
											onPrefetchLesson(toCurrentChapterLessonTarget(lesson.slug))}
										onfocus={() => onPrefetchLesson(toCurrentChapterLessonTarget(lesson.slug))}
										onclick={() => {
											activeMenu = null;
											onLessonSelect(lesson.slug);
										}}
									>
										<span class="topbar-menu-option-kicker">L{lesson.order}</span>
										<span class="topbar-menu-option-copy">
											<span class="topbar-menu-option-title">{lesson.title}</span>
											<span class="topbar-menu-option-meta">{getLessonMeta(lesson)}</span>
										</span>
										<span
											class={`topbar-menu-option-status ${
												completedLessonSlugSet.has(lesson.slug)
													? 'topbar-menu-option-status-complete'
													: ''
											} ${currentLesson.slug === lesson.slug ? 'topbar-menu-option-status-current' : ''}`}
											aria-hidden="true"
										></span>
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>

			<div class="topbar-card topbar-nav flex shrink-0 items-center gap-1.5 rounded-full">
				<button
					type="button"
					onclick={() => onNavigateLesson(previousLesson)}
					onpointerenter={() => onPrefetchLesson(previousLesson)}
					onfocus={() => onPrefetchLesson(previousLesson)}
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
					onpointerenter={() => onPrefetchLesson(nextLesson)}
					onfocus={() => onPrefetchLesson(nextLesson)}
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

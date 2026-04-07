<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { authActions, authState } from '$lib/auth';
	import GoogleSignInButton from '$lib/components/auth/GoogleSignInButton.svelte';
	import ProfilePill from '$lib/components/auth/ProfilePill.svelte';

	let { data } = $props();

	const courseSlug = 'python';
	const pageBackground =
		'radial-gradient(circle at top, rgba(223, 79, 143, 0.16), transparent 30%), linear-gradient(180deg, var(--kk-bg) 0%, var(--kk-bg-deep) 100%)';
	const panelBackground = 'linear-gradient(180deg, rgba(31, 22, 35, 0.96), rgba(19, 14, 23, 0.98))';

	const totalLessons = $derived(data.sequence.length);
	const firstLesson = $derived(data.sequence[0] ?? null);
	const activeCourseState = $derived.by(() => $authState.courseStates[courseSlug] ?? null);
	const completedLessonSlugSet = $derived.by(
		() => new Set(activeCourseState?.completedLessonSlugs ?? [])
	);
	const completedLessonsCount = $derived.by(() => completedLessonSlugSet.size);
	const nextIncompleteLesson = $derived.by(
		() => data.sequence.find((lesson) => !completedLessonSlugSet.has(lesson.slug)) ?? null
	);
	const resumeTarget = $derived.by(() => {
		if (activeCourseState?.lastActiveChapterSlug && activeCourseState.lastActiveLessonSlug) {
			return {
				chapterSlug: activeCourseState.lastActiveChapterSlug,
				lessonSlug: activeCourseState.lastActiveLessonSlug
			};
		}

		if (nextIncompleteLesson) {
			return {
				chapterSlug: nextIncompleteLesson.chapterSlug,
				lessonSlug: nextIncompleteLesson.slug
			};
		}

		if (!firstLesson) return null;

		return {
			chapterSlug: firstLesson.chapterSlug,
			lessonSlug: firstLesson.slug
		};
	});
	const resumeLabel = $derived.by(() => {
		if (completedLessonsCount === 0) return 'Start course';
		if (completedLessonsCount === totalLessons) return 'Review course';
		return 'Resume course';
	});

	const chapterProgress = $derived.by(() =>
		Object.fromEntries(
			data.chapters.map((chapter) => [
				chapter.slug,
				data.sequence.filter(
					(lesson) => lesson.chapterSlug === chapter.slug && completedLessonSlugSet.has(lesson.slug)
				).length
			])
		)
	);
	const profileInitials = $derived.by(() => {
		const name = $authState.user?.name?.trim();
		if (!name) return 'KK';

		return name
			.split(/\s+/)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('');
	});

	const formatOrder = (value: number) => String(value).padStart(2, '0');

	onMount(() => {
		void authActions.prompt();
	});
</script>

<div
	class="relative min-h-screen px-6 py-16 text-[var(--kk-text)] sm:py-20"
	style:background={pageBackground}
>
	<ProfilePill />

	<div class="mx-auto max-w-6xl">
		<div class="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_22rem] lg:items-start">
			<div class="max-w-2xl">
				<p class="text-xs font-semibold tracking-[0.28em] text-[var(--kk-highlight)] uppercase">
					Courses
				</p>
				<h1 class="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Start with Python.</h1>
				<p class="mt-4 text-base leading-7 text-[var(--kk-text-soft)] sm:text-lg">
					A simple course list with short chapters, real coding lessons, and a consistent path
					through the curriculum.
				</p>
			</div>

			<section
				class="rounded-[1.6rem] border p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
				style:background="linear-gradient(180deg, rgba(39, 27, 43, 0.92), rgba(20, 14, 25, 0.96))"
				style:border-color="var(--kk-border)"
			>
				{#if $authState.status === 'signed_in' && $authState.user}
					<div class="flex items-center gap-4">
						<div
							class="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-[var(--kk-panel-3)]"
						>
							{#if $authState.user.imageUrl}
								<img
									src={$authState.user.imageUrl}
									alt={$authState.user.name}
									class="h-full w-full object-cover"
								/>
							{:else}
								<span class="text-sm font-semibold tracking-[0.12em] text-[var(--kk-text)]">
									{profileInitials}
								</span>
							{/if}
						</div>

						<div class="min-w-0">
							<p
								class="text-xs font-semibold tracking-[0.24em] text-[var(--kk-text-dim)] uppercase"
							>
								Signed in
							</p>
							<p class="truncate text-lg font-semibold text-[var(--kk-text)]">
								{$authState.user.name}
							</p>
							{#if $authState.user.email}
								<p class="truncate text-sm text-[var(--kk-text-soft)]">{$authState.user.email}</p>
							{/if}
						</div>
					</div>

					<div class="mt-6 grid grid-cols-2 gap-3">
						<div class="rounded-2xl border border-[var(--kk-border)] bg-white/3 px-4 py-4">
							<p class="text-xs tracking-[0.18em] text-[var(--kk-text-dim)] uppercase">Progress</p>
							<p class="mt-2 text-2xl font-semibold text-[var(--kk-text)]">
								{completedLessonsCount}/{totalLessons}
							</p>
						</div>
						<div class="rounded-2xl border border-[var(--kk-border)] bg-white/3 px-4 py-4">
							<p class="text-xs tracking-[0.18em] text-[var(--kk-text-dim)] uppercase">Settings</p>
							<p class="mt-2 text-sm leading-6 text-[var(--kk-text-soft)]">
								Vim mode and editor layout follow your account.
							</p>
						</div>
					</div>

					{#if resumeTarget}
						<a
							href={resolve('/app/[chapterSlug]/[lessonSlug]', {
								chapterSlug: resumeTarget.chapterSlug,
								lessonSlug: resumeTarget.lessonSlug
							})}
							class="mt-6 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition hover:brightness-110"
							style:background="var(--kk-accent)"
							style:color="var(--kk-text)"
						>
							{resumeLabel}
						</a>
					{/if}
				{:else}
					<p class="text-xs font-semibold tracking-[0.24em] text-[var(--kk-text-dim)] uppercase">
						Google sign-in
					</p>
					<h2 class="mt-3 text-2xl font-semibold tracking-tight text-[var(--kk-text)]">
						Keep your course progress.
					</h2>
					<p class="mt-3 text-sm leading-6 text-[var(--kk-text-soft)]">
						Sign in once and Convex will keep your completed lessons, resume point, Vim mode, and
						editor layout tied to your Google account.
					</p>

					<div class="mt-6">
						<GoogleSignInButton text="continue_with" width={280} />
					</div>

					{#if $authState.status === 'error' && $authState.errorMessage}
						<p class="mt-4 text-sm text-[#ffd8df]">{$authState.errorMessage}</p>
					{/if}
				{/if}
			</section>
		</div>

		<section
			class="mt-12 overflow-hidden rounded-[1.75rem] border"
			style:background={panelBackground}
			style:border-color="var(--kk-border)"
		>
			<div class="border-b px-6 py-8 sm:px-8" style:border-color="var(--kk-border)">
				<div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<div class="max-w-2xl">
						<p class="text-xs font-semibold tracking-[0.28em] text-[var(--kk-text-dim)] uppercase">
							Course 01
						</p>
						<h2 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Python</h2>
						<p class="mt-3 text-sm leading-6 text-[var(--kk-text-soft)] sm:text-base">
							Learn the fundamentals step by step, from output and variables through functions,
							loops, data structures, debugging, and review.
						</p>
					</div>

					{#if resumeTarget}
						<a
							href={resolve('/app/[chapterSlug]/[lessonSlug]', {
								chapterSlug: resumeTarget.chapterSlug,
								lessonSlug: resumeTarget.lessonSlug
							})}
							class="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition hover:brightness-110"
							style:background="var(--kk-accent)"
							style:color="var(--kk-text)"
						>
							{resumeLabel}
						</a>
					{/if}
				</div>

				<div class="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--kk-text-dim)]">
					<span>{data.chapters.length} chapters</span>
					<span>{totalLessons} lessons</span>
					{#if $authState.status === 'signed_in'}
						<span>{completedLessonsCount} completed</span>
					{/if}
				</div>
			</div>

			<ul>
				{#each data.chapters as chapter (chapter.slug)}
					{@const chapterTarget = data.chapterTargets[chapter.slug]}
					{@const completedInChapter = chapterProgress[chapter.slug] ?? 0}
					<li
						class="px-6 py-5 transition hover:bg-white/2 sm:px-8"
						class:border-t={chapter.order > 1}
						style:border-color="var(--kk-border)"
					>
						<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
							<div class="flex gap-4 sm:gap-5">
								<div class="w-10 flex-none text-sm font-semibold text-[var(--kk-highlight)]">
									{formatOrder(chapter.order)}
								</div>
								<div class="min-w-0">
									<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
										<h3 class="text-lg font-medium text-[var(--kk-text)]">
											{chapter.title}
										</h3>
										<span class="text-sm text-[var(--kk-text-dim)]">
											{chapter.lessonCount} lessons
										</span>
										{#if $authState.status === 'signed_in'}
											<span class="text-sm text-[var(--kk-highlight)]">
												{completedInChapter}/{chapter.lessonCount} complete
											</span>
										{/if}
									</div>
									<p class="mt-2 max-w-2xl text-sm leading-6 text-[var(--kk-text-soft)]">
										{chapter.description}
									</p>
								</div>
							</div>

							{#if chapterTarget}
								<a
									href={resolve('/app/[chapterSlug]/[lessonSlug]', {
										chapterSlug: chapterTarget.chapterSlug,
										lessonSlug: chapterTarget.lessonSlug
									})}
									class="text-sm font-semibold text-[var(--kk-highlight)] transition hover:text-[var(--kk-text)]"
								>
									{completedInChapter > 0 ? 'Continue chapter' : 'Open chapter'}
								</a>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		</section>
	</div>
</div>

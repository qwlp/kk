<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { authActions, authState } from '$lib/auth';
	import GoogleSignInButton from '$lib/components/auth/GoogleSignInButton.svelte';
	import ProfilePill from '$lib/components/auth/ProfilePill.svelte';

	let { data } = $props();

	const courseSlug = 'python';
	const pageBackground =
		'radial-gradient(circle at 12% 10%, rgba(223, 79, 143, 0.14), transparent 24%), radial-gradient(circle at 88% 0%, rgba(255, 196, 104, 0.08), transparent 20%), linear-gradient(180deg, #171019 0%, #0f0b12 100%)';
	const panelBackground = 'linear-gradient(180deg, rgba(26, 19, 31, 0.94), rgba(15, 11, 18, 0.98))';

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
	const signedIn = $derived($authState.status === 'signed_in' && $authState.user !== null);
	const progressPercent = $derived.by(() =>
		totalLessons === 0 ? 0 : Math.round((completedLessonsCount / totalLessons) * 100)
	);

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
	class="relative min-h-screen px-6 py-10 text-[var(--kk-text)] sm:py-14"
	style:background={pageBackground}
>
	<ProfilePill />

	<div class="mx-auto max-w-6xl space-y-8">
		<section
			class="overflow-hidden rounded-[2rem] border px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:px-8 sm:py-10"
			style:background={panelBackground}
			style:border-color="var(--kk-border)"
		>
			<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
				<div class="max-w-2xl">
					<p
						class="inline-flex rounded-full border px-3 py-1 text-[0.7rem] font-semibold tracking-[0.24em] text-[var(--kk-highlight)] uppercase"
						style:border-color="rgba(255,255,255,0.08)"
					>
						Python Course
					</p>
					<h1 class="mt-5 max-w-xl text-4xl font-semibold tracking-tight sm:text-6xl">
						Learn Python by doing.
					</h1>
					<p class="mt-4 max-w-xl text-base leading-7 text-[var(--kk-text-soft)] sm:text-lg">
						Short lessons, real coding practice, and a clear path from basics to confidence.
					</p>

					<div class="mt-6 flex flex-wrap gap-3 text-sm">
						<div
							class="rounded-full border px-4 py-2 text-[var(--kk-text-soft)]"
							style:border-color="var(--kk-border)"
						>
							{data.chapters.length} chapters
						</div>
						<div
							class="rounded-full border px-4 py-2 text-[var(--kk-text-soft)]"
							style:border-color="var(--kk-border)"
						>
							{totalLessons} lessons
						</div>
						{#if signedIn}
							<div
								class="rounded-full border px-4 py-2 text-[var(--kk-text-soft)]"
								style:border-color="var(--kk-border)"
							>
								{completedLessonsCount} complete
							</div>
						{/if}
					</div>

					{#if resumeTarget}
						<div class="mt-8">
							<a
								href={resolve('/app/[chapterSlug]/[lessonSlug]', {
									chapterSlug: resumeTarget.chapterSlug,
									lessonSlug: resumeTarget.lessonSlug
								})}
								class="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition hover:brightness-110"
								style:background="var(--kk-accent)"
								style:color="var(--kk-text)"
							>
								{signedIn ? resumeLabel : 'Start learning'}
							</a>
						</div>
					{/if}
				</div>

				<section
					class="rounded-[1.5rem] border p-5"
					style:background="linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))"
					style:border-color="rgba(255,255,255,0.08)"
				>
					{#if signedIn && $authState.user}
						<div class="flex items-center gap-3">
							<div
								class="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-[var(--kk-panel-3)]"
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
								<p class="truncate text-base font-semibold text-[var(--kk-text)]">
									{$authState.user.name}
								</p>
								<p class="text-sm text-[var(--kk-text-soft)]">{progressPercent}% complete</p>
							</div>
						</div>

						<div class="mt-5">
							<div class="h-2 rounded-full bg-white/6">
								<div
									class="h-full rounded-full"
									style:background="var(--kk-accent)"
									style:width={`${progressPercent}%`}
								></div>
							</div>
							<p class="mt-3 text-sm text-[var(--kk-text-soft)]">
								{completedLessonsCount} of {totalLessons} lessons done. Your progress and editor settings
								stay synced.
							</p>
						</div>

						{#if resumeTarget}
							<a
								href={resolve('/app/[chapterSlug]/[lessonSlug]', {
									chapterSlug: resumeTarget.chapterSlug,
									lessonSlug: resumeTarget.lessonSlug
								})}
								class="mt-5 inline-flex w-full items-center justify-center rounded-full border px-4 py-3 text-sm font-semibold text-[var(--kk-text)] transition hover:border-white/20 hover:bg-white/6"
								style:border-color="var(--kk-border)"
							>
								{resumeLabel}
							</a>
						{/if}
					{:else}
						<div
							class="inline-flex rounded-full border px-3 py-1 text-[0.68rem] font-semibold tracking-[0.2em] text-[var(--kk-text-dim)] uppercase"
							style:border-color="rgba(255,255,255,0.08)"
						>
							Save Progress
						</div>
						<h2 class="mt-4 text-xl font-semibold tracking-tight text-[var(--kk-text)]">
							Sign in with Google
						</h2>
						<p class="mt-2 text-sm leading-6 text-[var(--kk-text-soft)]">
							Keep your place and come back exactly where you left off.
						</p>

						<div class="mt-5">
							<GoogleSignInButton theme="outline" size="medium" text="signin_with" width={260} />
						</div>

						<p class="mt-3 text-xs leading-5 text-[var(--kk-text-dim)]">
							Optional for browsing. Useful for saving progress.
						</p>

						{#if $authState.status === 'error' && $authState.errorMessage}
							<p class="mt-4 text-sm text-[#ffd8df]">{$authState.errorMessage}</p>
						{/if}
					{/if}
				</section>
			</div>
		</section>

		<section
			class="overflow-hidden rounded-[1.75rem] border"
			style:background={panelBackground}
			style:border-color="var(--kk-border)"
		>
			<div class="border-b px-6 py-6 sm:px-8" style:border-color="var(--kk-border)">
				<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div class="max-w-2xl">
						<p class="text-xs font-semibold tracking-[0.24em] text-[var(--kk-text-dim)] uppercase">
							Course Path
						</p>
						<h2 class="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Python</h2>
						<p class="mt-2 text-sm leading-6 text-[var(--kk-text-soft)]">
							Pick a chapter and move through the course one lesson at a time.
						</p>
					</div>
				</div>

				<div class="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--kk-text-dim)]">
					<span>{data.chapters.length} chapters</span>
					<span>{totalLessons} lessons</span>
					{#if signedIn}
						<span>{completedLessonsCount} completed</span>
					{/if}
				</div>
			</div>

			<ul class="grid gap-px bg-white/4 md:grid-cols-2">
				{#each data.chapters as chapter (chapter.slug)}
					{@const chapterTarget = data.chapterTargets[chapter.slug]}
					{@const completedInChapter = chapterProgress[chapter.slug] ?? 0}
					<li class="bg-transparent transition hover:bg-white/3">
						<div class="flex h-full flex-col gap-5 px-6 py-5 sm:px-8">
							<div class="flex items-start justify-between gap-4">
								<div class="flex min-w-0 items-start gap-4">
									<div
										class="grid h-10 w-10 flex-none place-items-center rounded-2xl border text-sm font-semibold text-[var(--kk-highlight)]"
										style:border-color="var(--kk-border)"
									>
										{formatOrder(chapter.order)}
									</div>
									<div class="min-w-0">
										<h3 class="text-lg font-medium text-[var(--kk-text)]">{chapter.title}</h3>
										<div
											class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[var(--kk-text-dim)]"
										>
											<span>{chapter.lessonCount} lessons</span>
											{#if signedIn}
												<span>{completedInChapter}/{chapter.lessonCount} complete</span>
											{/if}
										</div>
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
										{completedInChapter > 0 ? 'Continue' : 'Open'}
									</a>
								{/if}
							</div>
						</div>
					</li>
				{/each}
			</ul>
		</section>
	</div>
</div>

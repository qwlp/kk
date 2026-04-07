<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();

	const totalLessons = $derived(data.sequence.length);
	const firstLesson = $derived(data.sequence[0] ?? null);
	const pageBackground =
		'radial-gradient(circle at top, rgba(223, 79, 143, 0.16), transparent 30%), linear-gradient(180deg, var(--kk-bg) 0%, var(--kk-bg-deep) 100%)';
	const panelBackground = 'linear-gradient(180deg, rgba(31, 22, 35, 0.96), rgba(19, 14, 23, 0.98))';

	const formatOrder = (value: number) => String(value).padStart(2, '0');
</script>

<div
	class="min-h-screen px-6 py-16 text-[var(--kk-text)] sm:py-20"
	style:background={pageBackground}
>
	<div class="mx-auto max-w-5xl">
		<div class="max-w-2xl">
			<p class="text-xs font-semibold tracking-[0.28em] text-[var(--kk-highlight)] uppercase">
				Courses
			</p>
			<h1 class="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Start with Python.</h1>
			<p class="mt-4 text-base leading-7 text-[var(--kk-text-soft)] sm:text-lg">
				A simple course list with short chapters, real coding lessons, and a consistent path through
				the curriculum.
			</p>
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

					{#if firstLesson}
						<a
							href={resolve('/app/[chapterSlug]/[lessonSlug]', {
								chapterSlug: firstLesson.chapterSlug,
								lessonSlug: firstLesson.slug
							})}
							class="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition hover:brightness-110"
							style:background="var(--kk-accent)"
							style:color="var(--kk-text)"
						>
							Start course
						</a>
					{/if}
				</div>

				<div class="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--kk-text-dim)]">
					<span>{data.chapters.length} chapters</span>
					<span>{totalLessons} lessons</span>
				</div>
			</div>

			<ul>
				{#each data.chapters as chapter (chapter.slug)}
					{@const chapterTarget = data.chapterTargets[chapter.slug]}
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
									Open chapter
								</a>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		</section>
	</div>
</div>

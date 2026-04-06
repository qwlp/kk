<script lang="ts">
	import type { PublicLesson } from '$lib/types';

	interface Props {
		lesson: PublicLesson;
	}

	let { lesson }: Props = $props();
</script>

<section
	class="stone-panel flex h-full min-h-0 w-full flex-1 flex-col border-b border-white/8 lg:border-r lg:border-b-0"
>
	<div class="flex-1 overflow-y-auto px-5 pt-5 pb-10 md:px-6">
		<article
			class="lesson-markdown prose max-w-none prose-invert prose-headings:font-[Georgia,'Times_New_Roman',serif] prose-headings:tracking-tight prose-headings:text-[var(--kk-text)] prose-h1:mt-0 prose-h1:mb-5 prose-h1:text-[2.8rem] prose-p:font-mono prose-p:text-[1.02rem] prose-p:leading-8 prose-p:text-[var(--kk-text-soft)] prose-a:text-[var(--kk-highlight)] prose-a:no-underline hover:prose-a:text-[#ffd9ea] prose-blockquote:border-l-4 prose-blockquote:border-[var(--kk-highlight)] prose-blockquote:bg-[rgba(29,20,33,0.95)] prose-blockquote:py-4 prose-blockquote:pr-4 prose-blockquote:pl-5 prose-blockquote:font-mono prose-blockquote:text-[var(--kk-text)] prose-strong:text-[var(--kk-text)] prose-code:rounded prose-code:bg-[var(--kk-panel-3)] prose-code:px-2 prose-code:py-1 prose-code:text-[var(--kk-text)] prose-code:before:content-none prose-code:after:content-none prose-pre:!m-0 prose-pre:!border-0 prose-pre:!bg-transparent prose-pre:!p-0 prose-pre:shadow-none prose-ol:my-5 prose-ul:my-5 prose-li:font-mono prose-li:text-[1rem] prose-li:leading-8 prose-li:text-[var(--kk-text-soft)] prose-li:marker:text-[var(--kk-highlight)] prose-table:text-[var(--kk-text-soft)] prose-hr:border-[var(--kk-border)]"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html lesson.lessonHtml}
		</article>
	</div>
</section>

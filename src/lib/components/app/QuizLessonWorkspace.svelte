<script lang="ts">
	import type { QuizLesson } from '$lib/types';

	interface Props {
		lesson: QuizLesson;
		selectedChoiceId: string;
		submitting: boolean;
		onSelectChoice: (choiceId: string) => void;
		onSubmit: () => void;
	}

	let { lesson, selectedChoiceId, submitting, onSelectChoice, onSubmit }: Props = $props();
</script>

<section class="stone-panel flex h-full min-h-0 w-full flex-1 flex-col">
	<div class="flex min-h-0 flex-1 flex-col justify-between px-5 py-6 md:px-8">
		<div class="mx-auto flex w-full max-w-3xl flex-1 flex-col">
			<p
				class="font-mono text-xs font-semibold tracking-[0.22em] text-[var(--kk-text-dim)] uppercase"
			>
				Multiple Choice
			</p>
			<div
				class="prose mt-4 max-w-none prose-invert prose-p:my-0 prose-p:font-mono prose-p:text-2xl prose-p:leading-tight prose-p:text-[var(--kk-text)] prose-p:md:text-3xl prose-code:rounded prose-code:bg-[var(--kk-panel-3)] prose-code:px-2 prose-code:py-1 prose-code:text-[var(--kk-text)] prose-code:before:content-none prose-code:after:content-none"
			>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html lesson.questionHtml}
			</div>

			<div class="mt-8 flex flex-col gap-4">
				{#each lesson.choices as choice, index (choice.id)}
					<button
						type="button"
						onclick={() => onSelectChoice(choice.id)}
						class={`flex min-h-24 items-start gap-4 rounded-2xl border px-4 py-5 text-left transition ${
							selectedChoiceId === choice.id
								? 'border-[#e5b11f] bg-[rgba(229,177,31,0.09)] shadow-[0_0_0_1px_rgba(229,177,31,0.45)]'
								: 'border-[rgba(255,214,236,0.14)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,214,236,0.24)] hover:bg-[rgba(255,255,255,0.04)]'
						}`}
					>
						<span
							class={`grid h-10 w-10 shrink-0 place-items-center rounded-md border font-mono text-sm ${
								selectedChoiceId === choice.id
									? 'border-[#e5b11f]/70 bg-[rgba(229,177,31,0.12)] text-[#f5d36b]'
									: 'border-[rgba(255,214,236,0.12)] text-[var(--kk-text-dim)]'
							}`}
						>
							{index + 1}
						</span>
						<div
							class="prose max-w-none min-w-0 flex-1 self-center prose-invert prose-p:my-0 prose-p:font-mono prose-p:text-lg prose-p:leading-9 prose-p:text-[var(--kk-text)] prose-code:rounded prose-code:bg-[var(--kk-panel-3)] prose-code:px-2 prose-code:py-1 prose-code:text-[var(--kk-text)] prose-code:before:content-none prose-code:after:content-none"
						>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html choice.labelHtml}
						</div>
					</button>
				{/each}
			</div>
		</div>

		<div class="mt-8 flex justify-center">
			<button
				type="button"
				onclick={onSubmit}
				disabled={!selectedChoiceId || submitting}
				class="appearance-none rounded-full border-0 bg-[#d94f8b] px-8 py-3 font-mono text-[1rem] font-semibold text-[#ffe8f2] shadow-none transition hover:bg-[#c8437d] disabled:cursor-not-allowed disabled:opacity-50"
			>
				{submitting ? 'Submitting...' : 'Submit Answer'}
			</button>
		</div>
	</div>
</section>

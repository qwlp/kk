<script lang="ts">
	import { authActions, authState } from '$lib/auth';

	interface Props {
		width?: number;
		label?: string;
	}

	let { width = 280, label = 'Sign in with Google' }: Props = $props();

	const buttonLabel = $derived($authState.status === 'signing_in' ? 'Signing in...' : label);
</script>

{#if $authState.googleClientConfigured}
	<button
		type="button"
		class="inline-flex items-center justify-center gap-3 rounded-full border px-4 py-3 text-sm font-semibold text-[var(--kk-text)] transition hover:border-white/20 hover:bg-white/6 disabled:cursor-wait disabled:opacity-70"
		style:border-color="var(--kk-border)"
		style:width={`${width}px`}
		disabled={$authState.status === 'signing_in'}
		onclick={() => {
			void authActions.prompt();
		}}
	>
		<span class="grid h-6 w-6 place-items-center rounded-full bg-white text-[#4285f4]">
			<svg viewBox="0 0 24 24" class="h-4 w-4" aria-hidden="true">
				<path
					fill="currentColor"
					d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.8 4.8 0 0 1-2 3.1v2.6h3.2c1.9-1.8 3.1-4.4 3.1-7.5Z"
				/>
				<path
					fill="#34a853"
					d="M12 22c2.7 0 4.9-.9 6.5-2.3l-3.2-2.6c-.9.6-2 .9-3.3.9-2.5 0-4.6-1.7-5.4-4H3.3v2.7A10 10 0 0 0 12 22Z"
				/>
				<path
					fill="#fbbc04"
					d="M6.6 14c-.2-.6-.4-1.3-.4-2s.1-1.4.4-2V7.3H3.3A10 10 0 0 0 2.2 12c0 1.6.4 3 1.1 4.3L6.6 14Z"
				/>
				<path
					fill="#ea4335"
					d="M12 6c1.4 0 2.7.5 3.7 1.4l2.8-2.8A10 10 0 0 0 3.3 7.3L6.6 10c.8-2.3 3-4 5.4-4Z"
				/>
			</svg>
		</span>
		<span>{buttonLabel}</span>
	</button>
{:else}
	<p class="text-sm text-[var(--kk-text-dim)]">
		Set <code>PUBLIC_GOOGLE_CLIENT_ID</code> to enable Google sign-in.
	</p>
{/if}

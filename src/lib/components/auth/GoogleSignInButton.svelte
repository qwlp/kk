<script lang="ts">
	import { onMount } from 'svelte';
	import { authActions, authState } from '$lib/auth';

	interface Props {
		theme?: 'outline' | 'filled_black';
		size?: 'large' | 'medium' | 'small';
		text?: 'signin_with' | 'continue_with' | 'signup_with';
		width?: number;
	}

	let {
		theme = 'filled_black',
		size = 'large',
		text = 'continue_with',
		width = 280
	}: Props = $props();

	let container = $state<HTMLDivElement | null>(null);

	onMount(() => {
		if (!container) return;

		void authActions.renderGoogleButton(container, {
			theme,
			size,
			text,
			width,
			shape: 'pill',
			logo_alignment: 'left'
		});
	});
</script>

{#if $authState.googleClientConfigured}
	<div bind:this={container}></div>
{:else}
	<p class="text-sm text-[var(--kk-text-dim)]">
		Set <code>PUBLIC_GOOGLE_CLIENT_ID</code> to enable Google sign-in.
	</p>
{/if}

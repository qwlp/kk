<script lang="ts">
	import { onMount } from 'svelte';
	import { authActions } from '$lib/auth';
	import './layout.css';

	let { children } = $props();

	onMount(() => {
		void authActions.initialize();
	});
</script>

<svelte:head>
	<title>kk</title>
	<link rel="icon" href="/favicon.ico" sizes="any" />
</svelte:head>

{@render children()}

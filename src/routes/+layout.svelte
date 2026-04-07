<script lang="ts">
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>kk</title>
	<link rel="icon" href="/favicon.ico" sizes="any" />
</svelte:head>

{@render children()}

<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<div class="min-h-screen bg-stone-950 px-6 py-20 text-stone-100">
	<div class="mx-auto max-w-5xl">
		<p class="text-xs font-semibold tracking-[0.3em] text-amber-300 uppercase">Python Platform</p>
		<h1 class="mt-4 max-w-3xl text-5xl font-semibold tracking-tight">
			A small teaching platform with a real containerized Python runner.
		</h1>
		<p class="mt-6 max-w-2xl text-lg leading-8 text-stone-300">
			This prototype removes Clerk, keeps Convex for backend persistence, and grades Python code
			inside short-lived Docker sandboxes.
		</p>
		<div class="mt-10 flex flex-wrap gap-4">
			<a
				href={resolve('/app')}
				class="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-200"
			>
				Open the app
			</a>
			<a
				href="https://docs.docker.com/engine/security/seccomp/"
				class="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-stone-200 transition hover:border-white/20 hover:text-white"
			>
				Docker security docs
			</a>
		</div>
	</div>
</div>

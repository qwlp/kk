<script lang="ts">
	import { authActions, authState } from '$lib/auth';

	const initials = $derived.by(() => {
		const name = $authState.user?.name?.trim();
		if (!name) return 'KK';

		return name
			.split(/\s+/)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('');
	});
</script>

{#if $authState.status === 'signed_in' && $authState.user}
	<div class="pointer-events-auto absolute top-6 left-6 z-20">
		<div
			class="flex items-center gap-3 rounded-full border border-[var(--kk-border)] bg-[rgba(19,14,23,0.82)] px-3 py-2 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur"
		>
			<div
				class="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-[var(--kk-panel-3)]"
			>
				{#if $authState.user.imageUrl}
					<img
						src={$authState.user.imageUrl}
						alt={$authState.user.name}
						class="h-full w-full object-cover"
					/>
				{:else}
					<span class="text-sm font-semibold tracking-[0.12em] text-[var(--kk-text)]">
						{initials}
					</span>
				{/if}
			</div>

			<div class="hidden min-w-0 sm:block">
				<p class="truncate text-sm font-semibold text-[var(--kk-text)]">{$authState.user.name}</p>
				{#if $authState.user.email}
					<p class="truncate text-xs text-[var(--kk-text-dim)]">{$authState.user.email}</p>
				{/if}
			</div>

			<button
				type="button"
				onclick={() => authActions.signOut()}
				class="rounded-full border border-[var(--kk-border)] px-3 py-1.5 text-xs font-semibold tracking-[0.08em] text-[var(--kk-text-soft)] uppercase transition hover:border-[var(--kk-border-strong)] hover:text-[var(--kk-text)]"
			>
				Sign out
			</button>
		</div>
	</div>
{/if}

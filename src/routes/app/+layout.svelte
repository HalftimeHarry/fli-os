<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { AppContainer } from '$lib/core/container/AppContainer';
	import type { AppConfig } from '$lib/core/types/AppConfig';
	import { env } from '$env/dynamic/public';

	let { children } = $props();

	const appContainer = new AppContainer({
		pocketBaseUrl: env.PUBLIC_POCKETBASE_URL ?? 'http://127.0.0.1:8090'
	} as AppConfig);

	let resolving = $state(true);

	onMount(async () => {
		await appContainer.authContext.refresh();
		if (!appContainer.authContext.currentUser) {
			await goto(resolve('/login'));
			return;
		}
		resolving = false;
	});

	$effect(() => {
		if (!resolving && !appContainer.authContext.currentUser) {
			void goto(resolve('/login'));
		}
	});
</script>

{#if resolving}
	<div class="loading">Checking your session...</div>
{:else}
	{@render children()}
{/if}

<style>
	.loading {
		display: grid;
		place-items: center;
		min-height: 100vh;
		font-size: 1.1rem;
		font-weight: 600;
		color: #334155;
	}
</style>

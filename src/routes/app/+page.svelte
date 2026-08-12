<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppContainer } from '$lib/core/container/AppContainer';
	import type { AppConfig } from '$lib/core/types/AppConfig';
	import { Permission } from '$lib/domains/roles/Permission';
	import { env } from '$env/dynamic/public';

	const appContainer = new AppContainer({
		pocketBaseUrl: env.PUBLIC_POCKETBASE_URL ?? 'http://127.0.0.1:8090'
	} as AppConfig);

	const currentUser = appContainer.authContext.currentUser;
	const userName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : 'User';

	const navItems = [
		{ label: 'Overview', href: '/app' as const, permission: Permission.VIEW_USERS },
		{ label: 'Departments', href: '/app' as const, permission: Permission.MANAGE_DEPARTMENT },
		{ label: 'Users', href: '/app' as const, permission: Permission.MANAGE_USERS }
	];

	async function signOut() {
		appContainer.authContext.clear();
		await goto(resolve('/login'));
	}

	async function canShow(permission: Permission) {
		return appContainer.authorizationService.hasPermission(permission);
	}
</script>

<svelte:head>
	<title>Fli OS</title>
</svelte:head>

<div class="shell">
	<aside class="sidebar">
		<div class="brand">Fli OS</div>

		<nav>
			{#each navItems as item (item.href)}
				{#await canShow(item.permission)}
					<span class="nav-item placeholder">{item.label}</span>
				{:then allowed}
					{#if allowed}
						<a href={resolve(item.href)} class="nav-item">{item.label}</a>
					{/if}
				{/await}
			{/each}
		</nav>
	</aside>

	<main class="content">
		<header class="topbar">
			<div>
				<p class="eyebrow">Signed in</p>
				<h1>{userName}</h1>
			</div>
			<button onclick={signOut}>Sign out</button>
		</header>

		<section class="card">
			<h2>Organization context</h2>
			<p>{appContainer.authContext.organizationId ?? 'No organization'}</p>
		</section>
	</main>
</div>

<style>
	.shell {
		display: grid;
		grid-template-columns: 240px 1fr;
		min-height: 100vh;
		background: #f8fafc;
	}

	.sidebar {
		background: #0f172a;
		color: white;
		padding: 1.5rem 1rem;
	}

	.brand {
		font-size: 1.35rem;
		font-weight: 700;
		margin-bottom: 2rem;
	}

	nav {
		display: grid;
		gap: 0.5rem;
	}

	.nav-item,
	.placeholder {
		display: block;
		padding: 0.75rem 0.85rem;
		border-radius: 0.75rem;
		color: inherit;
		text-decoration: none;
		opacity: 0.9;
	}

	.nav-item {
		background: rgba(148, 163, 184, 0.12);
	}

	.placeholder {
		color: rgba(255, 255, 255, 0.7);
	}

	.content {
		padding: 2rem;
	}

	.topbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.eyebrow {
		margin: 0;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #64748b;
	}

	.topbar h1 {
		margin: 0.3rem 0 0;
		font-size: 2rem;
	}

	.topbar button {
		padding: 0.8rem 1rem;
		border: none;
		border-radius: 0.75rem;
		background: #1e293b;
		color: white;
		font: inherit;
		cursor: pointer;
	}

	.card {
		background: white;
		padding: 1.5rem;
		border-radius: 1rem;
		box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
	}

	.card h2 {
		margin-top: 0;
	}
</style>

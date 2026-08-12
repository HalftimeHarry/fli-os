<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { AppContainer } from '$lib/core/container/AppContainer';
	import type { AppConfig } from '$lib/core/types/AppConfig';
	import type { Project } from '$lib/domains/projects/Project';
	import { env } from '$env/dynamic/public';

	const appContainer = new AppContainer({
		pocketBaseUrl: env.PUBLIC_POCKETBASE_URL ?? 'http://127.0.0.1:8090'
	} as AppConfig);

	let projects = $state<Project[]>([]);
	let error = $state('');
	let loading = $state(true);

	onMount(async () => {
		if (!appContainer.authContext.currentUser) {
			await goto(resolve('/login'));
			return;
		}

		try {
			const result = await appContainer.projectController.findAll();
			if (!result.ok) {
				throw result.error;
			}
			projects = result.value;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unable to load projects.';
		} finally {
			loading = false;
		}
	});

	function openProject(projectId: string) {
		void goto(resolve(`/app/projects/${projectId}`));
	}
</script>

<svelte:head>
	<title>Projects</title>
</svelte:head>

<div class="page-shell">
	<div class="page-header">
		<div>
			<p class="eyebrow">Operations</p>
			<h1>Projects</h1>
		</div>
		<button class="primary-button" onclick={() => void goto(resolve('/app/projects/new'))}>
			New project
		</button>
	</div>

	{#if error}
		<p class="error">{error}</p>
	{/if}

	{#if loading}
		<p>Loading projects...</p>
	{:else if projects.length === 0}
		<div class="empty-state">
			<p>No projects have been created yet.</p>
		</div>
	{:else}
		<div class="project-grid">
			{#each projects as project (project.id)}
				<button class="project-card" type="button" onclick={() => openProject(project.id)}>
					<div class="card-topline">
						<span class="code">{project.code}</span>
						<span class="status">{project.status}</span>
					</div>
					<h2>{project.name}</h2>
					{#if project.budgetAmount !== null}
						<p class="meta">Budget: ${project.budgetAmount.toFixed(2)}</p>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page-shell {
		display: grid;
		gap: 1.5rem;
		padding: 2rem;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.eyebrow {
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.72rem;
		color: #64748b;
	}

	h1 {
		margin: 0.25rem 0 0;
		font-size: 2rem;
	}

	.primary-button {
		padding: 0.75rem 1rem;
		border: none;
		border-radius: 0.75rem;
		background: #0f172a;
		color: white;
		font: inherit;
		cursor: pointer;
	}

	.project-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
	}

	.project-card {
		display: grid;
		gap: 0.75rem;
		padding: 1rem;
		text-align: left;
		border: 1px solid #dbe3ee;
		border-radius: 1rem;
		background: white;
		box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
		cursor: pointer;
	}

	.card-topline {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.code {
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #334155;
	}

	.status {
		padding: 0.3rem 0.55rem;
		border-radius: 999px;
		background: #e2e8f0;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		color: #1e293b;
	}

	.project-card h2 {
		margin: 0;
		font-size: 1.2rem;
	}

	.meta {
		margin: 0;
		color: #475569;
	}

	.empty-state {
		padding: 1.5rem;
		border: 1px dashed #cbd5e1;
		border-radius: 1rem;
		background: #f8fafc;
	}

	.error {
		color: #b91c1c;
		font-weight: 600;
	}
</style>

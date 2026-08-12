<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { AppContainer } from '$lib/core/container/AppContainer';
	import type { AppConfig } from '$lib/core/types/AppConfig';
	import type { Department } from '$lib/domains/departments/Department';
	import { Project } from '$lib/domains/projects/Project';
	import { ProjectStatus } from '$lib/domains/projects/ProjectStatus';
	import { env } from '$env/dynamic/public';

	const appContainer = new AppContainer({
		pocketBaseUrl: env.PUBLIC_POCKETBASE_URL ?? 'http://127.0.0.1:8090'
	} as AppConfig);

	let departments = $state<Department[]>([]);
	let name = $state('');
	let code = $state('');
	let description = $state('');
	let departmentId = $state('');
	let budgetAmount = $state('');
	let startDate = $state('');
	let dueDate = $state('');
	let error = $state('');
	let submitting = $state(false);

	onMount(async () => {
		if (!appContainer.authContext.currentUser) {
			await goto(resolve('/login'));
			return;
		}

		const result = await appContainer.departmentService.findAll();
		const currentUser = appContainer.authContext.currentUser;
		const allowedDepartments = result.filter((department) => {
			return department.organizationId === currentUser.organizationId;
		});

		departments = currentUser.departmentIds.length
			? allowedDepartments.filter((department) => currentUser.departmentIds.includes(department.id))
			: allowedDepartments;

		if (departments.length > 0) {
			departmentId = departments[0].id;
		}
	});

	async function handleSubmit() {
		if (!appContainer.authContext.currentUser) {
			await goto(resolve('/login'));
			return;
		}

		error = '';
		if (!name.trim() || !code.trim() || !departmentId) {
			error = 'Name, code, and department are required.';
			return;
		}

		submitting = true;

		try {
			const project = new Project(
				crypto.randomUUID(),
				appContainer.authContext.currentUser.organizationId,
				departmentId,
				name.trim(),
				code.trim(),
				description.trim() || null,
				ProjectStatus.PLANNED,
				budgetAmount.trim() ? Number(budgetAmount) : null,
				startDate ? new Date(startDate) : null,
				dueDate ? new Date(dueDate) : null
			);

			const result = await appContainer.projectController.create(project);
			if (!result.ok) {
				throw result.error;
			}

			await goto(resolve(`/app/projects/${result.value.id}`));
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unable to create project.';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>New Project</title>
</svelte:head>

<div class="page-shell">
	<div class="page-header">
		<div>
			<p class="eyebrow">Projects</p>
			<h1>New project</h1>
		</div>
		<button
			class="secondary-button"
			type="button"
			onclick={() => void goto(resolve('/app/projects'))}
		>
			Back to projects
		</button>
	</div>

	<form
		class="form-card"
		onsubmit={(event) => {
			event.preventDefault();
			void handleSubmit();
		}}
	>
		<div class="field-grid">
			<label>
				<span>Name</span>
				<input bind:value={name} type="text" />
			</label>

			<label>
				<span>Code</span>
				<input bind:value={code} type="text" />
			</label>

			<label class="full-span">
				<span>Description</span>
				<textarea bind:value={description} rows="4"></textarea>
			</label>

			<label>
				<span>Department</span>
				<select bind:value={departmentId}>
					{#if departments.length === 0}
						<option value="">No departments available</option>
					{:else}
						{#each departments as department (department.id)}
							<option value={department.id}>{department.name}</option>
						{/each}
					{/if}
				</select>
			</label>

			<label>
				<span>Budget amount</span>
				<input bind:value={budgetAmount} type="number" min="0" step="0.01" />
			</label>

			<label>
				<span>Start date</span>
				<input bind:value={startDate} type="date" />
			</label>

			<label>
				<span>Due date</span>
				<input bind:value={dueDate} type="date" />
			</label>
		</div>

		{#if error}
			<p class="error">{error}</p>
		{/if}

		<div class="actions">
			<button class="primary-button" type="submit" disabled={submitting}>
				{submitting ? 'Creating...' : 'Create project'}
			</button>
		</div>
	</form>
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

	.form-card {
		display: grid;
		gap: 1.5rem;
		padding: 1.5rem;
		border: 1px solid #dbe3ee;
		border-radius: 1rem;
		background: white;
		box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
	}

	.field-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	label {
		display: grid;
		gap: 0.5rem;
		font-weight: 600;
		color: #1e293b;
	}

	.full-span {
		grid-column: 1 / -1;
	}

	input,
	textarea,
	select {
		width: 100%;
		padding: 0.8rem 0.9rem;
		border: 1px solid #cbd5e1;
		border-radius: 0.75rem;
		font: inherit;
		box-sizing: border-box;
	}

	textarea {
		resize: vertical;
	}

	.primary-button,
	.secondary-button {
		padding: 0.8rem 1rem;
		border: none;
		border-radius: 0.75rem;
		font: inherit;
		cursor: pointer;
	}

	.primary-button {
		background: #0f172a;
		color: white;
	}

	.secondary-button {
		background: #e2e8f0;
		color: #0f172a;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
	}

	.error {
		color: #b91c1c;
		font-weight: 600;
	}
</style>

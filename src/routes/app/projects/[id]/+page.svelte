<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { AppContainer } from '$lib/core/container/AppContainer';
	import type { AppConfig } from '$lib/core/types/AppConfig';
	import type { Project } from '$lib/domains/projects/Project';
	import { ProjectTask } from '$lib/domains/tasks/ProjectTask';
	import { TaskFinancialType } from '$lib/domains/tasks/TaskFinancialType';
	import { TaskStatus } from '$lib/domains/tasks/TaskStatus';
	import type { User } from '$lib/domains/users/User';
	import { env } from '$env/dynamic/public';

	const appContainer = new AppContainer({
		pocketBaseUrl: env.PUBLIC_POCKETBASE_URL ?? 'http://127.0.0.1:8090'
	} as AppConfig);

	const projectId = $derived(page.params.id ?? '');

	let project = $state<Project | null>(null);
	let tasks = $state<ProjectTask[]>([]);
	let users = $state<User[]>([]);
	let error = $state('');
	let taskError = $state('');
	let loading = $state(true);

	let title = $state('');
	let description = $state('');
	let assignedUserId = $state('');
	let status = $state(TaskStatus.TODO);
	let financialType = $state(TaskFinancialType.NONE);
	let estimatedCost = $state('');
	let dueDate = $state('');
	let submittingTask = $state(false);

	onMount(async () => {
		if (!appContainer.authContext.currentUser) {
			await goto(resolve('/login'));
			return;
		}
		await loadProjectData();
	});

	async function loadProjectData() {
		loading = true;
		error = '';

		try {
			if (!projectId) {
				throw new Error('Project id is missing.');
			}

			const projectResult = await appContainer.projectController.findById(projectId);
			if (!projectResult.ok) {
				throw projectResult.error;
			}
			project = projectResult.value;

			if (!project) {
				throw new Error('Project not found.');
			}

			const tasksResult = await appContainer.projectTaskController.findByProject(projectId);
			if (!tasksResult.ok) {
				throw tasksResult.error;
			}
			tasks = tasksResult.value;

			const allUsers = await appContainer.userService.findAll();
			users = allUsers.filter(
				(user) => project !== null && user.organizationId === project.organizationId
			);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unable to load project.';
		} finally {
			loading = false;
		}
	}

	async function handleAddTask() {
		if (!project) {
			return;
		}

		taskError = '';
		if (!title.trim()) {
			taskError = 'Task title is required.';
			return;
		}

		submittingTask = true;

		try {
			const task = new ProjectTask(
				crypto.randomUUID(),
				project.id,
				title.trim(),
				description.trim() || null,
				status,
				assignedUserId || null,
				financialType,
				estimatedCost.trim() ? Number(estimatedCost) : null,
				dueDate ? new Date(dueDate) : null
			);

			const result = await appContainer.projectTaskController.create(task);
			if (!result.ok) {
				throw result.error;
			}

			title = '';
			description = '';
			assignedUserId = '';
			status = TaskStatus.TODO;
			financialType = TaskFinancialType.NONE;
			estimatedCost = '';
			dueDate = '';
			await loadProjectData();
		} catch (err) {
			taskError = err instanceof Error ? err.message : 'Unable to create task.';
		} finally {
			submittingTask = false;
		}
	}

	async function updateTaskStatus(task: ProjectTask, nextStatus: TaskStatus) {
		const updated = new ProjectTask(
			task.id,
			task.projectId,
			task.title,
			task.description,
			nextStatus,
			task.assignedUserId,
			task.financialType,
			task.estimatedCost,
			task.dueDate
		);

		const result = await appContainer.projectTaskController.update(task.id, updated);
		if (!result.ok) {
			taskError = result.error.message;
			return;
		}

		await loadProjectData();
	}
</script>

<svelte:head>
	<title>{project ? project.name : 'Project details'}</title>
</svelte:head>

<div class="page-shell">
	{#if loading}
		<p>Loading project...</p>
	{:else if error}
		<p class="error">{error}</p>
	{:else if project}
		<div class="page-header">
			<div>
				<p class="eyebrow">Project</p>
				<h1>{project.name}</h1>
			</div>
			<button
				class="secondary-button"
				type="button"
				onclick={() => void goto(resolve('/app/projects'))}
			>
				Back to projects
			</button>
		</div>

		<section class="detail-card">
			<div class="detail-grid">
				<div>
					<p class="label">Code</p>
					<p>{project.code}</p>
				</div>
				<div>
					<p class="label">Status</p>
					<p>{project.status}</p>
				</div>
				<div>
					<p class="label">Budget</p>
					<p>{project.budgetAmount !== null ? `$${project.budgetAmount.toFixed(2)}` : 'Not set'}</p>
				</div>
				<div>
					<p class="label">Department</p>
					<p>{project.departmentId}</p>
				</div>
			</div>
			{#if project.description}
				<p class="description">{project.description}</p>
			{/if}
		</section>

		<section class="panel">
			<h2>Add task</h2>
			<form
				onsubmit={(event) => {
					event.preventDefault();
					void handleAddTask();
				}}
			>
				<div class="field-grid">
					<label>
						<span>Title</span>
						<input bind:value={title} type="text" />
					</label>

					<label>
						<span>Status</span>
						<select bind:value={status}>
							{#each Object.values(TaskStatus) as taskStatus (taskStatus)}
								<option value={taskStatus}>{taskStatus}</option>
							{/each}
						</select>
					</label>

					<label>
						<span>Assigned user</span>
						<select bind:value={assignedUserId}>
							<option value="">Unassigned</option>
							{#each users as user (user.id)}
								<option value={user.id}>{user.firstName} {user.lastName}</option>
							{/each}
						</select>
					</label>

					<label>
						<span>Financial type</span>
						<select bind:value={financialType}>
							{#each Object.values(TaskFinancialType) as type (type)}
								<option value={type}>{type}</option>
							{/each}
						</select>
					</label>

					<label>
						<span>Estimated cost</span>
						<input bind:value={estimatedCost} type="number" min="0" step="0.01" />
					</label>

					<label>
						<span>Due date</span>
						<input bind:value={dueDate} type="date" />
					</label>

					<label class="full-span">
						<span>Description</span>
						<textarea bind:value={description} rows="3"></textarea>
					</label>
				</div>

				{#if taskError}
					<p class="error">{taskError}</p>
				{/if}

				<div class="actions">
					<button class="primary-button" type="submit" disabled={submittingTask}>
						{submittingTask ? 'Adding task...' : 'Add task'}
					</button>
				</div>
			</form>
		</section>

		<section class="panel">
			<h2>Tasks</h2>
			{#if tasks.length === 0}
				<p>No tasks for this project yet.</p>
			{:else}
				<div class="task-list">
					{#each tasks as task (task.id)}
						<div class="task-item">
							<div>
								<h3>{task.title}</h3>
								{#if task.description}
									<p>{task.description}</p>
								{/if}
							</div>

							<div class="task-meta">
								<p>Status</p>
								<select
									value={task.status}
									onchange={(event) => {
										const next = (event.currentTarget as HTMLSelectElement).value as TaskStatus;
										void updateTaskStatus(task, next);
									}}
								>
									{#each Object.values(TaskStatus) as taskStatus (taskStatus)}
										<option value={taskStatus}>{taskStatus}</option>
									{/each}
								</select>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>
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

	h1,
	h2,
	h3,
	p {
		margin-top: 0;
	}

	h1 {
		margin-bottom: 0;
		font-size: 2rem;
	}

	.detail-card,
	.panel {
		display: grid;
		gap: 1rem;
		padding: 1.5rem;
		border: 1px solid #dbe3ee;
		border-radius: 1rem;
		background: white;
		box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
	}

	.detail-grid,
	.field-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.label {
		margin: 0 0 0.35rem;
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #64748b;
	}

	.description {
		margin: 0;
		color: #475569;
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

	.task-list {
		display: grid;
		gap: 1rem;
	}

	.task-item {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.9rem;
		background: #f8fafc;
	}

	.task-item p {
		margin: 0.25rem 0 0;
		color: #475569;
	}

	.task-meta {
		display: grid;
		gap: 0.45rem;
		min-width: 180px;
	}

	.task-meta p {
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #64748b;
	}

	.error {
		color: #b91c1c;
		font-weight: 600;
	}
</style>

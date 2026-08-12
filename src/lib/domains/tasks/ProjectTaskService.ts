import { AppError } from '$lib/core/errors/AppError';
import { err, ok, type Result } from '$lib/core/types/Result';
import type { ProjectRepository } from '$lib/domains/projects/ProjectRepository';
import type { UserRepository } from '$lib/domains/users/UserRepository';

import { ProjectTask } from './ProjectTask';
import type { ProjectTaskRepository } from './ProjectTaskRepository';
import { TaskFinancialType } from './TaskFinancialType';

export class ProjectTaskService {
	constructor(
		private readonly tasks: ProjectTaskRepository,
		private readonly projects: ProjectRepository,
		private readonly users: UserRepository
	) {}

	async findById(id: string): Promise<ProjectTask | null> {
		return this.tasks.findById(id);
	}

	async findByProject(projectId: string): Promise<ProjectTask[]> {
		return this.tasks.findByProject(projectId);
	}

	async create(task: ProjectTask): Promise<ProjectTask> {
		const validation = await this.validateProjectTask(task);
		if (!validation.ok) {
			throw validation.error;
		}

		return this.tasks.create(task);
	}

	async update(id: string, task: ProjectTask): Promise<ProjectTask> {
		if (id !== task.id) {
			throw new AppError(
				'ProjectTask ID does not match the requested update ID.',
				'PROJECT_TASK_ID_MISMATCH'
			);
		}

		const validation = await this.validateProjectTask(task);
		if (!validation.ok) {
			throw validation.error;
		}

		return this.tasks.update(id, task);
	}

	async delete(id: string): Promise<void> {
		await this.tasks.delete(id);
	}

	private async validateProjectTask(task: ProjectTask): Promise<Result<void, AppError>> {
		const project = await this.projects.findById(task.projectId);
		if (!project) {
			return err(
				new AppError(`Project ${task.projectId} does not exist.`, 'PROJECT_TASK_PROJECT_NOT_FOUND')
			);
		}

		if (task.assignedUserId !== null) {
			const assignedUser = await this.users.findById(task.assignedUserId);
			if (!assignedUser) {
				return err(
					new AppError(
						`User ${task.assignedUserId} does not exist.`,
						'PROJECT_TASK_ASSIGNED_USER_NOT_FOUND'
					)
				);
			}

			if (assignedUser.organizationId !== project.organizationId) {
				return err(
					new AppError(
						`User ${task.assignedUserId} does not belong to organization ${project.organizationId}.`,
						'PROJECT_TASK_USER_ORGANIZATION_MISMATCH'
					)
				);
			}
		}

		if (task.estimatedCost !== null && task.estimatedCost < 0) {
			return err(
				new AppError(
					'ProjectTask estimatedCost must be null or greater than or equal to zero.',
					'PROJECT_TASK_ESTIMATED_COST_INVALID'
				)
			);
		}

		if (task.financialType === TaskFinancialType.NONE && task.estimatedCost !== null) {
			return err(
				new AppError(
					'ProjectTask estimatedCost must be null when financialType is none.',
					'PROJECT_TASK_FINANCIAL_TYPE_COST_MISMATCH'
				)
			);
		}

		return ok(undefined);
	}
}

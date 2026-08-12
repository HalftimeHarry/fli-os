import { AppError } from '$lib/core/errors/AppError';
import { err, ok, type Result } from '$lib/core/types/Result';

import { ProjectTask } from './ProjectTask';
import type { ProjectTaskService } from './ProjectTaskService';

export class ProjectTaskController {
	constructor(private readonly service: ProjectTaskService) {}

	async findById(id: string): Promise<Result<ProjectTask | null, AppError>> {
		try {
			const task = await this.service.findById(id);
			return ok(task);
		} catch (error) {
			return this.toResult(error);
		}
	}

	async findByProject(projectId: string): Promise<Result<ProjectTask[], AppError>> {
		try {
			const tasks = await this.service.findByProject(projectId);
			return ok(tasks);
		} catch (error) {
			return this.toResult(error);
		}
	}

	async create(task: ProjectTask): Promise<Result<ProjectTask, AppError>> {
		try {
			const created = await this.service.create(task);
			return ok(created);
		} catch (error) {
			return this.toResult(error);
		}
	}

	async update(id: string, task: ProjectTask): Promise<Result<ProjectTask, AppError>> {
		try {
			const updated = await this.service.update(id, task);
			return ok(updated);
		} catch (error) {
			return this.toResult(error);
		}
	}

	async delete(id: string): Promise<Result<void, AppError>> {
		try {
			await this.service.delete(id);
			return ok(undefined);
		} catch (error) {
			return this.toResult(error);
		}
	}

	private toResult<T>(error: unknown): Result<T, AppError> {
		if (error instanceof AppError) {
			return err(error);
		}

		if (error instanceof Error) {
			return err(new AppError(error.message, 'PROJECT_TASK_CONTROLLER_UNEXPECTED_ERROR'));
		}

		return err(
			new AppError(
				'Unexpected project task controller error.',
				'PROJECT_TASK_CONTROLLER_UNEXPECTED_ERROR'
			)
		);
	}
}

import { AppError } from '$lib/core/errors/AppError';
import { err, ok, type Result } from '$lib/core/types/Result';

import { Project } from './Project';
import type { ProjectService } from './ProjectService';

export class ProjectController {
	constructor(private readonly service: ProjectService) {}

	async findById(id: string): Promise<Result<Project | null, AppError>> {
		try {
			const project = await this.service.findById(id);
			return ok(project);
		} catch (error) {
			return this.toResult(error);
		}
	}

	async findAll(): Promise<Result<Project[], AppError>> {
		try {
			const projects = await this.service.findAll();
			return ok(projects);
		} catch (error) {
			return this.toResult(error);
		}
	}

	async create(project: Project): Promise<Result<Project, AppError>> {
		try {
			const created = await this.service.create(project);
			return ok(created);
		} catch (error) {
			return this.toResult(error);
		}
	}

	async update(id: string, project: Project): Promise<Result<Project, AppError>> {
		try {
			const updated = await this.service.update(id, project);
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
			return err(new AppError(error.message, 'PROJECT_CONTROLLER_UNEXPECTED_ERROR'));
		}

		return err(
			new AppError('Unexpected project controller error.', 'PROJECT_CONTROLLER_UNEXPECTED_ERROR')
		);
	}
}

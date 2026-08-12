import { AppError } from '$lib/core/errors/AppError';
import { err, ok, type Result } from '$lib/core/types/Result';
import type { DepartmentRepository } from '$lib/domains/departments/DepartmentRepository';
import type { OrganizationRepository } from '$lib/domains/organization/OrganizationRepository';

import { Project } from './Project';
import type { ProjectRepository } from './ProjectRepository';

export class ProjectService {
	constructor(
		private readonly projects: ProjectRepository,
		private readonly organizations: OrganizationRepository,
		private readonly departments: DepartmentRepository
	) {}

	async findById(id: string): Promise<Project | null> {
		return this.projects.findById(id);
	}

	async findAll(): Promise<Project[]> {
		return this.projects.findAll();
	}

	async create(project: Project): Promise<Project> {
		const validation = await this.validateProject(project);
		if (!validation.ok) {
			throw validation.error;
		}

		return this.projects.create(project);
	}

	async update(id: string, project: Project): Promise<Project> {
		if (id !== project.id) {
			throw new AppError(
				'Project ID does not match the requested update ID.',
				'PROJECT_ID_MISMATCH'
			);
		}

		const validation = await this.validateProject(project);
		if (!validation.ok) {
			throw validation.error;
		}

		return this.projects.update(id, project);
	}

	async delete(id: string): Promise<void> {
		await this.projects.delete(id);
	}

	private async validateProject(project: Project): Promise<Result<void, AppError>> {
		const organization = await this.organizations.findById(project.organizationId);
		if (!organization) {
			return err(
				new AppError(
					`Organization ${project.organizationId} does not exist.`,
					'PROJECT_ORGANIZATION_NOT_FOUND'
				)
			);
		}

		const department = await this.departments.findById(project.departmentId);
		if (!department) {
			return err(
				new AppError(
					`Department ${project.departmentId} does not exist.`,
					'PROJECT_DEPARTMENT_NOT_FOUND'
				)
			);
		}

		if (department.organizationId !== project.organizationId) {
			return err(
				new AppError(
					`Department ${project.departmentId} does not belong to organization ${project.organizationId}.`,
					'PROJECT_DEPARTMENT_ORGANIZATION_MISMATCH'
				)
			);
		}

		const existing = await this.projects.findByCodeAndDepartment(
			project.code,
			project.departmentId
		);
		if (existing && existing.id !== project.id) {
			return err(
				new AppError(
					`Project code ${project.code} already exists in department ${project.departmentId}.`,
					'PROJECT_CODE_DUPLICATE'
				)
			);
		}

		if (project.budgetAmount !== null && project.budgetAmount < 0) {
			return err(
				new AppError(
					'Project budgetAmount must be null or greater than or equal to zero.',
					'PROJECT_BUDGET_INVALID'
				)
			);
		}

		if (project.startDate && project.dueDate && project.startDate > project.dueDate) {
			return err(
				new AppError(
					'Project startDate must be less than or equal to dueDate.',
					'PROJECT_DATE_RANGE_INVALID'
				)
			);
		}

		return ok(undefined);
	}
}

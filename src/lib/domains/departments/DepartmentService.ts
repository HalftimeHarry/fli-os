import { AppError } from '$lib/core/errors/AppError';
import { err, ok, type Result } from '$lib/core/types/Result';
import type { OrganizationRepository } from '$lib/domains/organization/OrganizationRepository';
import type { DepartmentRepository } from '$lib/domains/departments/DepartmentRepository';

import { Department } from './Department';

export class DepartmentService {
	constructor(
		private readonly departments: DepartmentRepository,
		private readonly organizations: OrganizationRepository
	) {}

	async findById(id: string): Promise<Department | null> {
		return this.departments.findById(id);
	}

	async findAll(): Promise<Department[]> {
		return this.departments.findAll();
	}

	async create(department: Department): Promise<Department> {
		const validation = await this.validateDepartmentRelationships(department);
		if (!validation.ok) {
			throw validation.error;
		}

		return this.departments.create(department);
	}

	async update(id: string, department: Department): Promise<Department> {
		if (id !== department.id) {
			throw new AppError(
				'Department ID does not match the requested update ID.',
				'DEPARTMENT_ID_MISMATCH'
			);
		}

		const validation = await this.validateDepartmentRelationships(department);
		if (!validation.ok) {
			throw validation.error;
		}

		return this.departments.update(id, department);
	}

	async delete(id: string): Promise<void> {
		await this.departments.delete(id);
	}

	private async validateDepartmentRelationships(
		department: Department
	): Promise<Result<void, AppError>> {
		const organization = await this.organizations.findById(department.organizationId);
		if (!organization) {
			return err(
				new AppError(
					`Organization ${department.organizationId} does not exist.`,
					'DEPARTMENT_ORGANIZATION_NOT_FOUND'
				)
			);
		}

		const existing = await this.departments.findByCodeAndOrganization(
			department.code,
			department.organizationId
		);
		if (existing && existing.id !== department.id) {
			return err(
				new AppError(
					`Department code ${department.code} already exists in organization ${department.organizationId}.`,
					'DEPARTMENT_CODE_DUPLICATE'
				)
			);
		}

		return ok(undefined);
	}
}

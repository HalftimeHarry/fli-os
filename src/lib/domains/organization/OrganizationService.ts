import { AppError } from '$lib/core/errors/AppError';
import { err, ok, type Result } from '$lib/core/types/Result';
import type { Organization } from './Organization';
import type { OrganizationRepository } from './OrganizationRepository';

export class OrganizationService {
	constructor(private readonly organizations: OrganizationRepository) {}

	async findById(id: string): Promise<Organization | null> {
		return this.organizations.findById(id);
	}

	async findAll(): Promise<Organization[]> {
		return this.organizations.findAll();
	}

	async create(organization: Organization): Promise<Organization> {
		const validation = this.validateOrganization(organization);
		if (!validation.ok) {
			throw validation.error;
		}

		return this.organizations.create(organization);
	}

	async update(id: string, organization: Organization): Promise<Organization> {
		if (id !== organization.id) {
			throw new AppError(
				'Organization ID does not match the requested update ID.',
				'ORGANIZATION_ID_MISMATCH'
			);
		}

		const validation = this.validateOrganization(organization);
		if (!validation.ok) {
			throw validation.error;
		}

		return this.organizations.update(id, organization);
	}

	async delete(id: string): Promise<void> {
		await this.organizations.delete(id);
	}

	private validateOrganization(organization: Organization): Result<void, AppError> {
		const name = organization.name.trim();
		if (!name) {
			return err(new AppError('Organization name is required.', 'ORGANIZATION_NAME_REQUIRED'));
		}

		const code = organization.code.trim();
		if (!code) {
			return err(new AppError('Organization code is required.', 'ORGANIZATION_CODE_REQUIRED'));
		}

		return ok(undefined);
	}
}

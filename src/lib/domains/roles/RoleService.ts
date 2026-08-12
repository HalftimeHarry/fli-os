import { AppError } from '$lib/core/errors/AppError';
import { err, ok, type Result } from '$lib/core/types/Result';
import type { OrganizationRepository } from '$lib/domains/organization/OrganizationRepository';
import type { RoleRepository } from '$lib/domains/roles/RoleRepository';

import { Permission } from './Permission';
import { Role } from './Role';

export class RoleService {
	constructor(
		private readonly roles: RoleRepository,
		private readonly organizations: OrganizationRepository
	) {}

	async findById(id: string): Promise<Role | null> {
		return this.roles.findById(id);
	}

	async findAll(): Promise<Role[]> {
		return this.roles.findAll();
	}

	async create(role: Role): Promise<Role> {
		const validation = await this.validateRoleRelationships(role);
		if (!validation.ok) {
			throw validation.error;
		}

		return this.roles.create(role);
	}

	async update(id: string, role: Role): Promise<Role> {
		if (id !== role.id) {
			throw new AppError('Role ID does not match the requested update ID.', 'ROLE_ID_MISMATCH');
		}

		const validation = await this.validateRoleRelationships(role);
		if (!validation.ok) {
			throw validation.error;
		}

		return this.roles.update(id, role);
	}

	async delete(id: string): Promise<void> {
		await this.roles.delete(id);
	}

	private async validateRoleRelationships(role: Role): Promise<Result<void, AppError>> {
		const organization = await this.organizations.findById(role.organizationId);
		if (!organization) {
			return err(
				new AppError(
					`Organization ${role.organizationId} does not exist.`,
					'ROLE_ORGANIZATION_NOT_FOUND'
				)
			);
		}

		for (const permission of role.permissions) {
			if (!Object.values(Permission).includes(permission)) {
				return err(
					new AppError(
						`Permission ${permission} is not valid for role ${role.id}.`,
						'ROLE_PERMISSION_INVALID'
					)
				);
			}
		}

		return ok(undefined);
	}
}

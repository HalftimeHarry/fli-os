import type { AppConfig } from '$lib/core/types/AppConfig';
import type { DepartmentRepository } from '$lib/domains/departments/DepartmentRepository';
import type { OrganizationRepository } from '$lib/domains/organization/OrganizationRepository';
import type { RoleRepository } from '$lib/domains/roles/RoleRepository';
import type { UserRepository } from '$lib/domains/users/UserRepository';
import { PocketBaseProvider } from '$lib/infrastructure/pocketbase/PocketBaseProvider';
import { PocketBaseDepartmentRepository } from '$lib/infrastructure/pocketbase/repositories/PocketBaseDepartmentRepository';
import { PocketBaseOrganizationRepository } from '$lib/infrastructure/pocketbase/repositories/PocketBaseOrganizationRepository';
import { PocketBaseRoleRepository } from '$lib/infrastructure/pocketbase/repositories/PocketBaseRoleRepository';
import { PocketBaseUserRepository } from '$lib/infrastructure/pocketbase/repositories/PocketBaseUserRepository';

/**
 * Composition root for application dependencies.
 *
 * Infrastructure providers, repositories, services,
 * and controllers will be assembled here.
 */
export class AppContainer {
	readonly pocketBase: PocketBaseProvider;
	readonly organizations: OrganizationRepository;
	readonly users: UserRepository;
	readonly roles: RoleRepository;
	readonly departments: DepartmentRepository;

	constructor(config: AppConfig) {
		this.pocketBase = new PocketBaseProvider(config.pocketBaseUrl);

		this.organizations = new PocketBaseOrganizationRepository(this.pocketBase);
		this.users = new PocketBaseUserRepository(this.pocketBase);
		this.roles = new PocketBaseRoleRepository(this.pocketBase);
		this.departments = new PocketBaseDepartmentRepository(this.pocketBase);
	}
}

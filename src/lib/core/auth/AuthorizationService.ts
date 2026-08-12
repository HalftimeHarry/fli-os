import { AuthContext } from '$lib/core/auth/AuthContext';
import type { RoleRepository } from '$lib/domains/roles/RoleRepository';
import { type Permission } from '$lib/domains/roles/Permission';

export class AuthorizationService {
	constructor(
		private readonly authContext: AuthContext,
		private readonly roles: RoleRepository
	) {}

	async hasPermission(permission: Permission): Promise<boolean> {
		if (!this.authContext.currentUser) {
			return false;
		}

		for (const roleId of this.authContext.roleIds) {
			const role = await this.roles.findById(roleId);
			if (!role) {
				continue;
			}

			if (role.can(permission)) {
				return true;
			}
		}

		return false;
	}

	canAccessDepartment(departmentId: string): boolean {
		if (!this.authContext.currentUser) {
			return false;
		}

		return this.authContext.departmentIds.includes(departmentId);
	}
}

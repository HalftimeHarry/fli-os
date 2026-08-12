import { Permission } from './Permission';
import { Role } from './Role';

export class RoleFactory {
	static fromPersistence(record: {
		id?: string;
		organizationId?: string;
		name?: string;
		permissions?: unknown;
	}): Role {
		const permissions = Array.isArray(record.permissions)
			? record.permissions
					.map((permission) => String(permission))
					.filter((permission): permission is Permission =>
						Object.values(Permission).includes(permission as Permission)
					)
			: [];

		return new Role(
			String(record.id ?? ''),
			String(record.organizationId ?? ''),
			String(record.name ?? ''),
			permissions
		);
	}

	static toPersistence(role: Role): {
		id: string;
		organizationId: string;
		name: string;
		permissions: readonly Permission[];
	} {
		return {
			id: role.id,
			organizationId: role.organizationId,
			name: role.name,
			permissions: role.permissions
		};
	}
}

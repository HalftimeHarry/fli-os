import { User } from './User';

export class UserFactory {
	static fromPersistence(record: {
		id?: string;
		organizationId?: string;
		organization?: string;
		email?: string;
		firstName?: string;
		lastName?: string;
		name?: string;
		roleIds?: string[];
		roles?: string[];
		departmentIds?: string[];
		departments?: string[];
	}): User {
		const fullName = String(record.name ?? '').trim();
		const firstNameFromName = fullName ? (fullName.split(/\s+/)[0] ?? '') : '';
		const lastNameFromName = fullName ? (fullName.split(/\s+/).slice(1).join(' ') ?? '') : '';

		return new User(
			String(record.id ?? ''),
			String(record.organizationId ?? record.organization ?? ''),
			String(record.email ?? ''),
			String(record.firstName ?? firstNameFromName),
			String(record.lastName ?? lastNameFromName),
			Array.isArray(record.roleIds)
				? record.roleIds
				: Array.isArray(record.roles)
					? record.roles
					: [],
			Array.isArray(record.departmentIds)
				? record.departmentIds
				: Array.isArray(record.departments)
					? record.departments
					: []
		);
	}

	static toPersistence(user: User): {
		email: string;
		name: string;
		organization?: string;
		roles?: readonly string[];
		departments?: readonly string[];
	} {
		const name = `${user.firstName} ${user.lastName}`.trim();

		return {
			email: user.email,
			name,
			organization: user.organizationId || undefined,
			roles: user.roleIds.length > 0 ? user.roleIds : undefined,
			departments: user.departmentIds.length > 0 ? user.departmentIds : undefined
		};
	}
}

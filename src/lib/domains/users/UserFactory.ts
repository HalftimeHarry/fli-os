import { User } from './User';

export class UserFactory {
	static fromPersistence(record: {
		id?: string;
		organizationId?: string;
		email?: string;
		firstName?: string;
		lastName?: string;
		roleIds?: string[];
		departmentIds?: string[];
	}): User {
		return new User(
			String(record.id ?? ''),
			String(record.organizationId ?? ''),
			String(record.email ?? ''),
			String(record.firstName ?? ''),
			String(record.lastName ?? ''),
			Array.isArray(record.roleIds) ? record.roleIds : [],
			Array.isArray(record.departmentIds) ? record.departmentIds : []
		);
	}

	static toPersistence(user: User): {
		id: string;
		organizationId: string;
		email: string;
		firstName: string;
		lastName: string;
		roleIds: readonly string[];
		departmentIds: readonly string[];
	} {
		return {
			id: user.id,
			organizationId: user.organizationId,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			roleIds: user.roleIds,
			departmentIds: user.departmentIds
		};
	}
}

import { AppError } from '$lib/core/errors/AppError';
import { err, ok, type Result } from '$lib/core/types/Result';
import type { DepartmentRepository } from '$lib/domains/departments/DepartmentRepository';
import type { OrganizationRepository } from '$lib/domains/organization/OrganizationRepository';
import type { RoleRepository } from '$lib/domains/roles/RoleRepository';
import type { UserRepository } from '$lib/domains/users/UserRepository';

import { User } from './User';

export class UserService {
	constructor(
		private readonly users: UserRepository,
		private readonly organizations: OrganizationRepository,
		private readonly roles: RoleRepository,
		private readonly departments: DepartmentRepository
	) {}

	async findById(id: string): Promise<User | null> {
		return this.users.findById(id);
	}

	async findAll(): Promise<User[]> {
		return this.users.findAll();
	}

	async create(user: User): Promise<User> {
		const validation = await this.validateUserRelationships(user);
		if (!validation.ok) {
			throw validation.error;
		}

		return this.users.create(user);
	}

	async createAccount(input: {
		email: string;
		password: string;
		firstName?: string;
		lastName?: string;
	}): Promise<User> {
		const email = input.email.trim();
		const firstName = (input.firstName ?? '').trim();
		const lastName = (input.lastName ?? '').trim();

		if (!email || !email.includes('@')) {
			throw new AppError('A valid email address is required.', 'USER_EMAIL_REQUIRED');
		}

		if (!input.password || input.password.length < 8) {
			throw new AppError('Password must be at least 8 characters long.', 'USER_PASSWORD_TOO_SHORT');
		}

		if (!firstName || !lastName) {
			throw new AppError('First and last name are required.', 'USER_NAME_REQUIRED');
		}

		const user = new User(crypto.randomUUID(), '', email, firstName, lastName, [], []);

		return this.users.create(user, input.password);
	}

	async update(id: string, user: User): Promise<User> {
		if (id !== user.id) {
			throw new AppError('User ID does not match the requested update ID.', 'USER_ID_MISMATCH');
		}

		const validation = await this.validateUserRelationships(user);
		if (!validation.ok) {
			throw validation.error;
		}

		return this.users.update(id, user);
	}

	async delete(id: string): Promise<void> {
		await this.users.delete(id);
	}

	private async validateUserRelationships(user: User): Promise<Result<void, AppError>> {
		const organization = await this.organizations.findById(user.organizationId);
		if (!organization) {
			return err(
				new AppError(
					`Organization ${user.organizationId} does not exist.`,
					'USER_ORGANIZATION_NOT_FOUND'
				)
			);
		}

		for (const roleId of user.roleIds) {
			const role = await this.roles.findById(roleId);
			if (!role) {
				return err(new AppError(`Role ${roleId} does not exist.`, 'USER_ROLE_NOT_FOUND'));
			}

			if (role.organizationId !== user.organizationId) {
				return err(
					new AppError(
						`Role ${roleId} does not belong to organization ${user.organizationId}.`,
						'USER_ROLE_ORGANIZATION_MISMATCH'
					)
				);
			}
		}

		for (const departmentId of user.departmentIds) {
			const department = await this.departments.findById(departmentId);
			if (!department) {
				return err(
					new AppError(`Department ${departmentId} does not exist.`, 'USER_DEPARTMENT_NOT_FOUND')
				);
			}

			if (department.organizationId !== user.organizationId) {
				return err(
					new AppError(
						`Department ${departmentId} does not belong to organization ${user.organizationId}.`,
						'USER_DEPARTMENT_ORGANIZATION_MISMATCH'
					)
				);
			}
		}

		return ok(undefined);
	}
}

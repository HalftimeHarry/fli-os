import { AppError } from '$lib/core/errors/AppError';
import { err, ok, type Result } from '$lib/core/types/Result';

import { User } from './User';
import type { UserService } from './UserService';

export class UserController {
	constructor(private readonly service: UserService) {}

	async createAccount(input: {
		email: string;
		password: string;
		firstName?: string;
		lastName?: string;
	}): Promise<Result<User, AppError>> {
		try {
			const created = await this.service.createAccount(input);
			return ok(created);
		} catch (error) {
			return this.toResult(error);
		}
	}

	async findById(id: string): Promise<Result<User | null, AppError>> {
		try {
			const user = await this.service.findById(id);
			return ok(user);
		} catch (error) {
			return this.toResult(error);
		}
	}

	async findAll(): Promise<Result<User[], AppError>> {
		try {
			const users = await this.service.findAll();
			return ok(users);
		} catch (error) {
			return this.toResult(error);
		}
	}

	private toResult<T>(error: unknown): Result<T, AppError> {
		if (error instanceof AppError) {
			return err(error);
		}

		if (error instanceof Error) {
			return err(new AppError(error.message, 'USER_CONTROLLER_UNEXPECTED_ERROR'));
		}

		return err(
			new AppError('Unexpected user controller error.', 'USER_CONTROLLER_UNEXPECTED_ERROR')
		);
	}
}

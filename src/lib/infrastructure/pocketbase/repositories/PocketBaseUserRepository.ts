import { UserFactory } from '$lib/domains/users/UserFactory';
import type { UserRepository } from '$lib/domains/users/UserRepository';
import type { User } from '$lib/domains/users/User';
import type { PocketBaseProvider } from '$lib/infrastructure/pocketbase/PocketBaseProvider';
import type { UserRecord } from '$lib/infrastructure/pocketbase/records/UserRecord';

export class PocketBaseUserRepository implements UserRepository {
	constructor(private readonly provider: PocketBaseProvider) {}

	async findById(id: string): Promise<User | null> {
		const record = await this.provider.client.collection('users').getOne<UserRecord>(id);
		return UserFactory.fromPersistence(record);
	}

	async findAll(): Promise<User[]> {
		const records = await this.provider.client.collection('users').getFullList<UserRecord>();
		return records.map((record) => UserFactory.fromPersistence(record));
	}

	async create(user: User, password?: string): Promise<User> {
		const passwordValue = password ?? '';
		const payload: Record<string, unknown> = {
			...UserFactory.toPersistence(user),
			password: passwordValue,
			passwordConfirm: passwordValue
		};

		const record = await this.provider.client.collection('users').create<UserRecord>(payload);
		return UserFactory.fromPersistence(record);
	}

	async update(id: string, user: User): Promise<User> {
		const record = await this.provider.client
			.collection('users')
			.update<UserRecord>(id, UserFactory.toPersistence(user));
		return UserFactory.fromPersistence(record);
	}

	async delete(id: string): Promise<void> {
		await this.provider.client.collection('users').delete(id);
	}
}

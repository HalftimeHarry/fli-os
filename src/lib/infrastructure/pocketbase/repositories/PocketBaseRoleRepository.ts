import { RoleFactory } from '$lib/domains/roles/RoleFactory';
import type { RoleRepository } from '$lib/domains/roles/RoleRepository';
import type { Role } from '$lib/domains/roles/Role';
import type { PocketBaseProvider } from '$lib/infrastructure/pocketbase/PocketBaseProvider';
import type { RoleRecord } from '$lib/infrastructure/pocketbase/records/RoleRecord';

export class PocketBaseRoleRepository implements RoleRepository {
	constructor(private readonly provider: PocketBaseProvider) {}

	async findById(id: string): Promise<Role | null> {
		const record = await this.provider.client.collection('roles').getOne<RoleRecord>(id);
		return RoleFactory.fromPersistence(record);
	}

	async findAll(): Promise<Role[]> {
		const records = await this.provider.client.collection('roles').getFullList<RoleRecord>();
		return records.map((record) => RoleFactory.fromPersistence(record));
	}

	async create(role: Role): Promise<Role> {
		const record = await this.provider.client
			.collection('roles')
			.create<RoleRecord>(RoleFactory.toPersistence(role));
		return RoleFactory.fromPersistence(record);
	}

	async update(id: string, role: Role): Promise<Role> {
		const record = await this.provider.client
			.collection('roles')
			.update<RoleRecord>(id, RoleFactory.toPersistence(role));
		return RoleFactory.fromPersistence(record);
	}

	async delete(id: string): Promise<void> {
		await this.provider.client.collection('roles').delete(id);
	}
}

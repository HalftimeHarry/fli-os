import { DepartmentFactory } from '$lib/domains/departments/DepartmentFactory';
import type { DepartmentRepository } from '$lib/domains/departments/DepartmentRepository';
import type { Department } from '$lib/domains/departments/Department';
import type { PocketBaseProvider } from '$lib/infrastructure/pocketbase/PocketBaseProvider';
import type { DepartmentRecord } from '$lib/infrastructure/pocketbase/records/DepartmentRecord';

export class PocketBaseDepartmentRepository implements DepartmentRepository {
	constructor(private readonly provider: PocketBaseProvider) {}

	async findById(id: string): Promise<Department | null> {
		const record = await this.provider.client
			.collection('departments')
			.getOne<DepartmentRecord>(id);
		return DepartmentFactory.fromPersistence(record);
	}

	async findAll(): Promise<Department[]> {
		const records = await this.provider.client
			.collection('departments')
			.getFullList<DepartmentRecord>();
		return records.map((record) => DepartmentFactory.fromPersistence(record));
	}

	async create(department: Department): Promise<Department> {
		const record = await this.provider.client
			.collection('departments')
			.create<DepartmentRecord>(DepartmentFactory.toPersistence(department));
		return DepartmentFactory.fromPersistence(record);
	}

	async update(id: string, department: Department): Promise<Department> {
		const record = await this.provider.client
			.collection('departments')
			.update<DepartmentRecord>(id, DepartmentFactory.toPersistence(department));
		return DepartmentFactory.fromPersistence(record);
	}

	async delete(id: string): Promise<void> {
		await this.provider.client.collection('departments').delete(id);
	}
}

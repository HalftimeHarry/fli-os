import { OrganizationFactory } from '$lib/domains/organization/OrganizationFactory';
import type { OrganizationRepository } from '$lib/domains/organization/OrganizationRepository';
import type { Organization } from '$lib/domains/organization/Organization';
import type { PocketBaseProvider } from '$lib/infrastructure/pocketbase/PocketBaseProvider';
import type { OrganizationRecord } from '$lib/infrastructure/pocketbase/records/OrganizationRecord';

export class PocketBaseOrganizationRepository implements OrganizationRepository {
	constructor(private readonly provider: PocketBaseProvider) {}

	async findById(id: string): Promise<Organization | null> {
		const record = await this.provider.client
			.collection('organizations')
			.getOne<OrganizationRecord>(id);
		return OrganizationFactory.fromPersistence(record);
	}

	async findAll(): Promise<Organization[]> {
		const records = await this.provider.client
			.collection('organizations')
			.getFullList<OrganizationRecord>();
		return records.map((record) => OrganizationFactory.fromPersistence(record));
	}

	async create(organization: Organization): Promise<Organization> {
		const record = await this.provider.client
			.collection('organizations')
			.create<OrganizationRecord>(OrganizationFactory.toPersistence(organization));
		return OrganizationFactory.fromPersistence(record);
	}

	async update(id: string, organization: Organization): Promise<Organization> {
		const record = await this.provider.client
			.collection('organizations')
			.update<OrganizationRecord>(id, OrganizationFactory.toPersistence(organization));
		return OrganizationFactory.fromPersistence(record);
	}

	async delete(id: string): Promise<void> {
		await this.provider.client.collection('organizations').delete(id);
	}
}

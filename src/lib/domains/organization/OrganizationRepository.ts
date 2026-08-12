import type { Organization } from './Organization';

export interface OrganizationRepository {
	findById(id: string): Promise<Organization | null>;
	findAll(): Promise<Organization[]>;
	create(organization: Organization): Promise<Organization>;
	update(id: string, organization: Organization): Promise<Organization>;
	delete(id: string): Promise<void>;
}

import { Organization } from './Organization';

export class OrganizationFactory {
	static fromPersistence(record: { id?: string; name?: unknown; code?: unknown }): Organization {
		return new Organization(
			String(record.id ?? ''),
			String(record.name ?? ''),
			String(record.code ?? '')
		);
	}

	static toPersistence(organization: Organization): { id: string; name: string; code: string } {
		return {
			id: organization.id,
			name: organization.name,
			code: organization.code
		};
	}
}

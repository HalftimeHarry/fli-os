import { Department } from './Department';

export class DepartmentFactory {
	static fromPersistence(record: {
		id?: string;
		organizationId?: string;
		name?: string;
		code?: string;
		description?: string;
	}): Department {
		return new Department(
			String(record.id ?? ''),
			String(record.organizationId ?? ''),
			String(record.name ?? ''),
			String(record.code ?? ''),
			record.description
		);
	}

	static toPersistence(department: Department): {
		id: string;
		organizationId: string;
		name: string;
		code: string;
		description?: string;
	} {
		return {
			id: department.id,
			organizationId: department.organizationId,
			name: department.name,
			code: department.code,
			description: department.description
		};
	}
}

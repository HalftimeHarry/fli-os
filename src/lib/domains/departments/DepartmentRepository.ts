import type { Department } from './Department';

export interface DepartmentRepository {
	findById(id: string): Promise<Department | null>;
	findByCodeAndOrganization(code: string, organizationId: string): Promise<Department | null>;
	findAll(): Promise<Department[]>;
	create(department: Department): Promise<Department>;
	update(id: string, department: Department): Promise<Department>;
	delete(id: string): Promise<void>;
}

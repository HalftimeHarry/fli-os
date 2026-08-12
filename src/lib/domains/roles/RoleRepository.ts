import type { Role } from './Role';

export interface RoleRepository {
	findById(id: string): Promise<Role | null>;
	findAll(): Promise<Role[]>;
	create(role: Role): Promise<Role>;
	update(id: string, role: Role): Promise<Role>;
	delete(id: string): Promise<void>;
}

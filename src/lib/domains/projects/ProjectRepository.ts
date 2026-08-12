import type { Project } from './Project';

export interface ProjectRepository {
	findById(id: string): Promise<Project | null>;
	findAll(): Promise<Project[]>;
	findByCodeAndDepartment(code: string, departmentId: string): Promise<Project | null>;
	create(project: Project): Promise<Project>;
	update(id: string, project: Project): Promise<Project>;
	delete(id: string): Promise<void>;
}

import type { ProjectTask } from './ProjectTask';

export interface ProjectTaskRepository {
	findById(id: string): Promise<ProjectTask | null>;
	findByProject(projectId: string): Promise<ProjectTask[]>;
	create(task: ProjectTask): Promise<ProjectTask>;
	update(id: string, task: ProjectTask): Promise<ProjectTask>;
	delete(id: string): Promise<void>;
}

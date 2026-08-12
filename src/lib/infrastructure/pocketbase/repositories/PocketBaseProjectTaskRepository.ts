import { ProjectTaskFactory } from '$lib/domains/tasks/ProjectTaskFactory';
import type { ProjectTask } from '$lib/domains/tasks/ProjectTask';
import type { ProjectTaskRepository } from '$lib/domains/tasks/ProjectTaskRepository';
import type { PocketBaseProvider } from '$lib/infrastructure/pocketbase/PocketBaseProvider';
import type { ProjectTaskRecord } from '$lib/infrastructure/pocketbase/records/ProjectTaskRecord';

export class PocketBaseProjectTaskRepository implements ProjectTaskRepository {
	constructor(private readonly provider: PocketBaseProvider) {}

	async findById(id: string): Promise<ProjectTask | null> {
		const record = await this.provider.client
			.collection('project_tasks')
			.getOne<ProjectTaskRecord>(id);
		return ProjectTaskFactory.fromPersistence(record);
	}

	async findByProject(projectId: string): Promise<ProjectTask[]> {
		const filter = this.provider.client.filter('project = {:projectId}', { projectId });
		const records = await this.provider.client
			.collection('project_tasks')
			.getFullList<ProjectTaskRecord>({ filter });
		return records.map((record) => ProjectTaskFactory.fromPersistence(record));
	}

	async create(task: ProjectTask): Promise<ProjectTask> {
		const record = await this.provider.client
			.collection('project_tasks')
			.create<ProjectTaskRecord>(ProjectTaskFactory.toPersistence(task));
		return ProjectTaskFactory.fromPersistence(record);
	}

	async update(id: string, task: ProjectTask): Promise<ProjectTask> {
		const record = await this.provider.client
			.collection('project_tasks')
			.update<ProjectTaskRecord>(id, ProjectTaskFactory.toPersistence(task));
		return ProjectTaskFactory.fromPersistence(record);
	}

	async delete(id: string): Promise<void> {
		await this.provider.client.collection('project_tasks').delete(id);
	}
}

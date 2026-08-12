import { ProjectFactory } from '$lib/domains/projects/ProjectFactory';
import type { Project } from '$lib/domains/projects/Project';
import type { ProjectRepository } from '$lib/domains/projects/ProjectRepository';
import type { PocketBaseProvider } from '$lib/infrastructure/pocketbase/PocketBaseProvider';
import type { ProjectRecord } from '$lib/infrastructure/pocketbase/records/ProjectRecord';

export class PocketBaseProjectRepository implements ProjectRepository {
	constructor(private readonly provider: PocketBaseProvider) {}

	async findById(id: string): Promise<Project | null> {
		const record = await this.provider.client.collection('projects').getOne<ProjectRecord>(id);
		return ProjectFactory.fromPersistence(record);
	}

	async findAll(): Promise<Project[]> {
		const records = await this.provider.client.collection('projects').getFullList<ProjectRecord>();
		return records.map((record) => ProjectFactory.fromPersistence(record));
	}

	async findByCodeAndDepartment(code: string, departmentId: string): Promise<Project | null> {
		const filter = this.provider.client.filter('code = {:code} && department = {:departmentId}', {
			code,
			departmentId
		});

		const record = await this.provider.client
			.collection('projects')
			.getFirstListItem<ProjectRecord>(filter)
			.catch((error) => {
				if (error?.status === 404) {
					return null;
				}
				throw error;
			});

		return record ? ProjectFactory.fromPersistence(record) : null;
	}

	async create(project: Project): Promise<Project> {
		const record = await this.provider.client
			.collection('projects')
			.create<ProjectRecord>(ProjectFactory.toPersistence(project));
		return ProjectFactory.fromPersistence(record);
	}

	async update(id: string, project: Project): Promise<Project> {
		const record = await this.provider.client
			.collection('projects')
			.update<ProjectRecord>(id, ProjectFactory.toPersistence(project));
		return ProjectFactory.fromPersistence(record);
	}

	async delete(id: string): Promise<void> {
		await this.provider.client.collection('projects').delete(id);
	}
}

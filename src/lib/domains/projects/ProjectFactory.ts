import { Project, ProjectStatus } from './Project';

export class ProjectFactory {
	static fromPersistence(record: {
		id?: string;
		organizationId?: string;
		departmentId?: string;
		name?: string;
		code?: string;
		description?: string | null;
		status?: unknown;
		budgetAmount?: unknown;
		startDate?: unknown;
		dueDate?: unknown;
	}): Project {
		const normalizedStatus = Object.values(ProjectStatus).includes(
			String(record.status) as ProjectStatus
		)
			? (String(record.status) as ProjectStatus)
			: ProjectStatus.PLANNED;

		return new Project(
			String(record.id ?? ''),
			String(record.organizationId ?? ''),
			String(record.departmentId ?? ''),
			String(record.name ?? ''),
			String(record.code ?? ''),
			record.description ?? null,
			normalizedStatus,
			record.budgetAmount === null || record.budgetAmount === undefined
				? null
				: Number(record.budgetAmount),
			record.startDate === null || record.startDate === undefined
				? null
				: record.startDate instanceof Date
					? record.startDate
					: new Date(String(record.startDate)),
			record.dueDate === null || record.dueDate === undefined
				? null
				: record.dueDate instanceof Date
					? record.dueDate
					: new Date(String(record.dueDate))
		);
	}

	static toPersistence(project: Project): {
		id: string;
		organizationId: string;
		departmentId: string;
		name: string;
		code: string;
		description: string | null;
		status: ProjectStatus;
		budgetAmount: number | null;
		startDate: Date | null;
		dueDate: Date | null;
	} {
		return {
			id: project.id,
			organizationId: project.organizationId,
			departmentId: project.departmentId,
			name: project.name,
			code: project.code,
			description: project.description,
			status: project.status,
			budgetAmount: project.budgetAmount,
			startDate: project.startDate,
			dueDate: project.dueDate
		};
	}
}

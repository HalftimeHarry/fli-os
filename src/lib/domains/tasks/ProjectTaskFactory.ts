import { ProjectTask } from './ProjectTask';
import { TaskFinancialType } from './TaskFinancialType';
import { TaskStatus } from './TaskStatus';

export class ProjectTaskFactory {
	static fromPersistence(record: {
		id?: string;
		projectId?: string;
		title?: string;
		description?: string | null;
		status?: unknown;
		assignedUserId?: string | null;
		financialType?: unknown;
		estimatedCost?: unknown;
		dueDate?: unknown;
	}): ProjectTask {
		const normalizedStatus = Object.values(TaskStatus).includes(String(record.status) as TaskStatus)
			? (String(record.status) as TaskStatus)
			: TaskStatus.TODO;

		const normalizedFinancialType = Object.values(TaskFinancialType).includes(
			String(record.financialType) as TaskFinancialType
		)
			? (String(record.financialType) as TaskFinancialType)
			: TaskFinancialType.NONE;

		return new ProjectTask(
			String(record.id ?? ''),
			String(record.projectId ?? ''),
			String(record.title ?? ''),
			record.description ?? null,
			normalizedStatus,
			record.assignedUserId ?? null,
			normalizedFinancialType,
			record.estimatedCost === null || record.estimatedCost === undefined
				? null
				: Number(record.estimatedCost),
			record.dueDate === null || record.dueDate === undefined
				? null
				: record.dueDate instanceof Date
					? record.dueDate
					: new Date(String(record.dueDate))
		);
	}

	static toPersistence(task: ProjectTask): {
		id: string;
		projectId: string;
		title: string;
		description: string | null;
		status: TaskStatus;
		assignedUserId: string | null;
		financialType: TaskFinancialType;
		estimatedCost: number | null;
		dueDate: Date | null;
	} {
		return {
			id: task.id,
			projectId: task.projectId,
			title: task.title,
			description: task.description,
			status: task.status,
			assignedUserId: task.assignedUserId,
			financialType: task.financialType,
			estimatedCost: task.estimatedCost,
			dueDate: task.dueDate
		};
	}
}

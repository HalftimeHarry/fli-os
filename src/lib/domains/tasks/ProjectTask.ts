import type { TaskFinancialType } from './TaskFinancialType';
import type { TaskStatus } from './TaskStatus';

export class ProjectTask {
	constructor(
		public readonly id: string,
		public readonly projectId: string,
		public readonly title: string,
		public readonly description: string | null,
		public readonly status: TaskStatus,
		public readonly assignedUserId: string | null,
		public readonly financialType: TaskFinancialType,
		public readonly estimatedCost: number | null,
		public readonly dueDate: Date | null
	) {}
}

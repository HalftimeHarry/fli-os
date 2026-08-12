export enum ProjectStatus {
	PLANNED = 'planned',
	ACTIVE = 'active',
	ON_HOLD = 'on_hold',
	COMPLETED = 'completed',
	CANCELLED = 'cancelled'
}

export class Project {
	constructor(
		public readonly id: string,
		public readonly organizationId: string,
		public readonly departmentId: string,
		public readonly name: string,
		public readonly code: string,
		public readonly description: string | null,
		public readonly status: ProjectStatus,
		public readonly budgetAmount: number | null,
		public readonly startDate: Date | null,
		public readonly dueDate: Date | null
	) {}
}

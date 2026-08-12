export interface ProjectTaskRecord {
	id: string;
	project: string;
	title: string;
	description?: string;
	status: string;
	assignedUser?: string;
	financialType: string;
	estimatedCost?: number;
	dueDate?: string;
}

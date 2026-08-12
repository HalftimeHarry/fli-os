export interface ProjectRecord {
	id: string;
	organization: string;
	department: string;
	name: string;
	code: string;
	description?: string;
	status: string;
	budgetAmount?: number;
	startDate?: string;
	dueDate?: string;
}

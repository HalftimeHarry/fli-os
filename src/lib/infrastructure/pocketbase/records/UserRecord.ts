export interface UserRecord {
	id: string;
	email: string;
	name?: string;
	firstName?: string;
	lastName?: string;
	organization?: string;
	roles?: string[];
	departments?: string[];
}

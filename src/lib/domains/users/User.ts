export class User {
	constructor(
		public readonly id: string,
		public readonly organizationId: string,
		public readonly email: string,
		public readonly firstName: string,
		public readonly lastName: string,
		public readonly roleIds: readonly string[],
		public readonly departmentIds: readonly string[]
	) {}

	get fullName(): string {
		return `${this.firstName} ${this.lastName}`.trim();
	}
}

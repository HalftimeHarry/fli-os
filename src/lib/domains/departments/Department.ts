export class Department {
	constructor(
		public readonly id: string,
		public readonly organizationId: string,
		public readonly name: string,
		public readonly code: string,
		public readonly description?: string
	) {}
}

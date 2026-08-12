import { type Permission } from './Permission';

export class Role {
	constructor(
		public readonly id: string,
		public readonly organizationId: string,
		public readonly name: string,
		public readonly permissions: readonly Permission[]
	) {}

	can(permission: Permission): boolean {
		return this.permissions.includes(permission);
	}
}

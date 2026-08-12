import type { PocketBaseProvider } from '$lib/infrastructure/pocketbase/PocketBaseProvider';
import type { UserRepository } from '$lib/domains/users/UserRepository';
import type { User } from '$lib/domains/users/User';

export class AuthContext {
	private currentUserValue: User | null = null;

	constructor(
		private readonly provider: PocketBaseProvider,
		private readonly users: UserRepository
	) {}

	get isAuthenticated(): boolean {
		// Application-level auth status: treat the actor as unauthenticated unless we can
		// resolve the current Fli OS user from the active PocketBase session.
		return this.currentUserValue !== null;
	}

	get currentUser(): User | null {
		return this.currentUserValue;
	}

	get organizationId(): string | null {
		return this.currentUserValue?.organizationId ?? null;
	}

	get roleIds(): readonly string[] {
		return this.currentUserValue?.roleIds ?? [];
	}

	get departmentIds(): readonly string[] {
		return this.currentUserValue?.departmentIds ?? [];
	}

	async refresh(): Promise<void> {
		const authRecord = this.provider.currentUser;
		if (!this.provider.isAuthenticated || !authRecord?.id) {
			this.currentUserValue = null;
			return;
		}

		try {
			this.currentUserValue = await this.users.findById(authRecord.id);
		} catch {
			// TODO: distinguish between "no valid Fli OS user for this session" and a
			// transient backend outage so a service failure does not masquerade as logout.
			this.currentUserValue = null;
		}
	}

	clear(): void {
		this.provider.clearAuth();
		this.currentUserValue = null;
	}
}

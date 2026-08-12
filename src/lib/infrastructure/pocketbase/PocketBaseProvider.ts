import PocketBase, { type RecordModel } from 'pocketbase';

/**
 * Minimal wrapper around the PocketBase SDK.
 * Owns a single PocketBase client instance and exposes
 * infrastructure-level authentication state.
 */
export class PocketBaseProvider {
	private readonly clientInstance: PocketBase;

	constructor(baseUrl: string) {
		this.clientInstance = new PocketBase(baseUrl);
	}

	get client(): PocketBase {
		return this.clientInstance;
	}

	get isAuthenticated(): boolean {
		return this.clientInstance.authStore.isValid;
	}

	get currentUser(): RecordModel | null {
		return this.clientInstance.authStore.record;
	}

	clearAuth(): void {
		this.clientInstance.authStore.clear();
	}
}

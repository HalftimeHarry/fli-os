import type { AppConfig } from '$lib/core/types/AppConfig';
import { PocketBaseProvider } from '$lib/infrastructure/pocketbase/PocketBaseProvider';

/**
 * Composition root for application dependencies.
 *
 * Infrastructure providers, repositories, services,
 * and controllers will be assembled here.
 */
export class AppContainer {
	readonly pocketBase: PocketBaseProvider;

	constructor(config: AppConfig) {
		this.pocketBase = new PocketBaseProvider(config.pocketBaseUrl);
	}
}

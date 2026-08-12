<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppContainer } from '$lib/core/container/AppContainer';
	import type { AppConfig } from '$lib/core/types/AppConfig';
	import { env } from '$env/dynamic/public';

	const appContainer = new AppContainer({
		pocketBaseUrl: env.PUBLIC_POCKETBASE_URL ?? 'http://127.0.0.1:8090'
	} as AppConfig);

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let submitting = $state(false);

	async function handleSubmit() {
		error = '';
		submitting = true;

		try {
			await appContainer.pocketBase.authenticate('users', email, password);
			await appContainer.authContext.refresh();
			if (!appContainer.authContext.currentUser) {
				throw new Error('Authentication succeeded but no Fli OS user was resolved.');
			}
			await goto(resolve('/app'));
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unable to sign in.';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Fli OS Login</title>
</svelte:head>

<div class="login-shell">
	<form
		class="login-card"
		onsubmit={(event) => {
			event.preventDefault();
			void handleSubmit();
		}}
	>
		<h1>Fli OS</h1>
		<p>Sign in to continue</p>

		<label>
			<span>Email</span>
			<input bind:value={email} type="email" name="email" autocomplete="email" required />
		</label>

		<label>
			<span>Password</span>
			<input
				bind:value={password}
				type="password"
				name="password"
				autocomplete="current-password"
				required
			/>
		</label>

		{#if error}
			<p class="error">{error}</p>
		{/if}

		<button type="submit" disabled={submitting}>
			{submitting ? 'Signing in...' : 'Sign in'}
		</button>
	</form>
</div>

<style>
	.login-shell {
		display: grid;
		place-items: center;
		min-height: 100vh;
		padding: 1.5rem;
		background: #f4f7fb;
	}

	.login-card {
		display: grid;
		gap: 1rem;
		width: min(100%, 420px);
		padding: 2rem;
		border-radius: 1rem;
		background: white;
		box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
	}

	.login-card h1 {
		margin: 0;
		font-size: 2rem;
	}

	.login-card p {
		margin: 0;
		color: #475569;
	}

	.login-card label {
		display: grid;
		gap: 0.5rem;
		font-weight: 600;
		color: #1e293b;
	}

	.login-card input {
		padding: 0.8rem 0.9rem;
		border: 1px solid #cbd5e1;
		border-radius: 0.75rem;
		font: inherit;
	}

	.login-card button {
		padding: 0.85rem 1rem;
		border: none;
		border-radius: 0.75rem;
		background: #0f172a;
		color: white;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}

	.login-card button:disabled {
		opacity: 0.7;
		cursor: wait;
	}

	.error {
		color: #b91c1c;
		font-weight: 600;
	}
</style>

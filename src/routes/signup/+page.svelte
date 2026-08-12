<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppContainer } from '$lib/core/container/AppContainer';
	import type { AppConfig } from '$lib/core/types/AppConfig';
	import { env } from '$env/dynamic/public';

	const appContainer = new AppContainer({
		pocketBaseUrl: env.PUBLIC_POCKETBASE_URL ?? 'http://127.0.0.1:8090'
	} as AppConfig);

	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let submitting = $state(false);

	async function handleSubmit() {
		error = '';
		if (!firstName.trim() || !lastName.trim()) {
			error = 'First and last name are required.';
			return;
		}

		if (!email.trim() || !email.includes('@')) {
			error = 'A valid email address is required.';
			return;
		}

		if (password.length < 8) {
			error = 'Password must be at least 8 characters long.';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Passwords do not match.';
			return;
		}

		submitting = true;

		try {
			const result = await appContainer.userController.createAccount({
				email,
				password,
				firstName,
				lastName
			});

			if (!result.ok) {
				throw result.error;
			}

			await appContainer.pocketBase.authenticate('users', email, password);
			await appContainer.authContext.refresh();

			if (!appContainer.authContext.currentUser) {
				throw new Error('Account created, but no Fli OS user was resolved.');
			}

			await goto(resolve('/app'));
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unable to create account.';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Create account</title>
</svelte:head>

<div class="signup-shell">
	<form
		class="signup-card"
		onsubmit={(event) => {
			event.preventDefault();
			void handleSubmit();
		}}
	>
		<h1>Create your account</h1>
		<p>Start managing your organization in Fli OS.</p>

		<div class="field-grid">
			<label>
				<span>First name</span>
				<input
					bind:value={firstName}
					type="text"
					name="firstName"
					autocomplete="given-name"
					required
				/>
			</label>

			<label>
				<span>Last name</span>
				<input
					bind:value={lastName}
					type="text"
					name="lastName"
					autocomplete="family-name"
					required
				/>
			</label>
		</div>

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
				autocomplete="new-password"
				required
			/>
		</label>

		<label>
			<span>Confirm password</span>
			<input
				bind:value={confirmPassword}
				type="password"
				name="confirmPassword"
				autocomplete="new-password"
				required
			/>
		</label>

		{#if error}
			<p class="error">{error}</p>
		{/if}

		<button type="submit" disabled={submitting}>
			{submitting ? 'Creating account...' : 'Create account'}
		</button>

		<p class="login-link">
			Already have an account?
			<a href={resolve('/login')}>Sign in</a>
		</p>
	</form>
</div>

<style>
	.signup-shell {
		display: grid;
		place-items: center;
		min-height: 100vh;
		padding: 1.5rem;
		background: #f4f7fb;
	}

	.signup-card {
		display: grid;
		gap: 1rem;
		width: min(100%, 520px);
		padding: 2rem;
		border-radius: 1rem;
		background: white;
		box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
	}

	.signup-card h1 {
		margin: 0;
		font-size: 2rem;
	}

	.signup-card p {
		margin: 0;
		color: #475569;
	}

	.field-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.signup-card label {
		display: grid;
		gap: 0.5rem;
		font-weight: 600;
		color: #1e293b;
	}

	.signup-card input {
		padding: 0.8rem 0.9rem;
		border: 1px solid #cbd5e1;
		border-radius: 0.75rem;
		font: inherit;
	}

	.signup-card button {
		padding: 0.85rem 1rem;
		border: none;
		border-radius: 0.75rem;
		background: #0f172a;
		color: white;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}

	.signup-card button:disabled {
		opacity: 0.7;
		cursor: wait;
	}

	.login-link {
		text-align: center;
	}

	.login-link a {
		color: #0f172a;
		font-weight: 700;
	}

	.error {
		color: #b91c1c;
		font-weight: 600;
	}
</style>

<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<div class="landing-shell">
	<div class="hero-card">
		<p class="eyebrow">Fli OS</p>
		<h1>Run your league operations in one place.</h1>
		<p class="lede">
			Create your account to manage departments, projects, tasks, and operational workflow from a
			single system.
		</p>

		<div class="actions">
			<a class="primary-button" href={resolve('/signup')}>Create account</a>
			<a class="secondary-button" href={resolve('/login')}>Sign in</a>
		</div>
	</div>
</div>

<style>
	.landing-shell {
		display: grid;
		place-items: center;
		min-height: 100vh;
		padding: 1.5rem;
		background: linear-gradient(135deg, #f8fafc 0%, #eef5ff 100%);
	}

	.hero-card {
		display: grid;
		gap: 1rem;
		max-width: 640px;
		width: min(100%, 640px);
		padding: 2.5rem;
		border: 1px solid #dbe3ee;
		border-radius: 1.5rem;
		background: rgba(255, 255, 255, 0.96);
		box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
	}

	.eyebrow {
		margin: 0;
		font-size: 0.74rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #475569;
	}

	h1 {
		margin: 0;
		font-size: clamp(2.2rem, 6vw, 4rem);
		line-height: 1.05;
		color: #0f172a;
	}

	.lede {
		margin: 0;
		font-size: 1.05rem;
		line-height: 1.7;
		color: #475569;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.9rem;
		margin-top: 0.5rem;
	}

	.primary-button,
	.secondary-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.9rem 1.2rem;
		border-radius: 0.85rem;
		font-weight: 700;
		text-decoration: none;
		transition: transform 0.15s ease;
	}

	.primary-button {
		background: #0f172a;
		color: white;
	}

	.secondary-button {
		background: #e2e8f0;
		color: #0f172a;
	}

	.primary-button:hover,
	.secondary-button:hover {
		transform: translateY(-1px);
	}
</style>

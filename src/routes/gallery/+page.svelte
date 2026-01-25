<script lang="ts">
	import LandingNav from '$lib/components/landing/LandingNav.svelte';
	import FooterSection from '$lib/components/landing/FooterSection.svelte';
	import PageHeader from '$lib/components/shared/PageHeader.svelte';
	import { m } from '$lib/paraglide/messages';
	import { cart } from '$lib/stores/cart.svelte';

	let email = $state('');

	function handleSubmit(e: Event) {
		e.preventDefault();
		// Email signup is non-functional for now
	}
</script>

<div class="flex min-h-screen flex-col">
	<LandingNav cartCount={cart.count} />
	<PageHeader title={m.gallery_title()} subtitle={m.gallery_subtitle()} />

	<main class="grow bg-cream py-16">
		<div class="fc-container">
			<div class="mb-16 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
				{#each Array(8) as _, i}
					<div
						class="flex aspect-square items-center justify-center border-3 border-ink/20 bg-cream-warm"
					>
						<span class="heading text-4xl text-ink/10">?</span>
					</div>
				{/each}
			</div>

			<div class="mx-auto max-w-2xl text-center">
				<div class="brutal-card paper-shadow-md bg-cream-warm p-12">
					<span class="tag tag-coral mb-6 inline-block">{m.gallery_coming_soon()}</span>
					<p class="body-large mb-8 text-ink-muted">{m.gallery_coming_soon_desc()}</p>

					<h3 class="heading-3 mb-4">{m.gallery_signup_title()}</h3>
					<p class="body mb-6 text-ink-muted">{m.gallery_signup_desc()}</p>

					<form onsubmit={handleSubmit} class="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
						<input
							type="email"
							bind:value={email}
							placeholder={m.gallery_email_placeholder()}
							class="input grow"
							required
						/>
						<button type="submit" class="btn btn-primary paper-press">
							{m.gallery_signup_btn()}
						</button>
					</form>
				</div>
			</div>
		</div>
	</main>

	<FooterSection />
</div>

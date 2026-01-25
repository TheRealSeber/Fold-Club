<script lang="ts">
	import { getLocale, localizeHref, setLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { cart } from '$lib/stores/cart.svelte.ts';
	import { analytics } from '$lib/stores/analytics';

	type Props = {
		cartCount?: number;
	};

	let { cartCount = 0 }: Props = $props();

	const locale = getLocale();

	let showToast = $state(false);

	function handleCheckoutClick() {
		analytics.trackCheckoutClick(cart.getProductIds());
		showToast = true;
		setTimeout(() => {
			showToast = false;
		}, 3000);
	}
</script>

<header class="border-b-3 border-ink bg-paper">
	<nav
		class="fc-container flex items-center justify-between py-4"
		aria-label={m.nav_primary_aria()}
	>
		<a href={localizeHref('/')} class="heading text-2xl tracking-tight">
			<span class="hidden sm:inline">FOLD<span class="text-coral">.</span>CLUB</span>
			<span class="inline sm:hidden">F<span class="text-coral">.</span>C</span>
		</a>

		<div class="hidden items-center gap-8 md:flex">
			<a href={localizeHref('/shop')} class="label hover:text-coral">
				{m.nav_shop()}
			</a>
			<a href={localizeHref('/gallery')} class="label hover:text-coral">
				{m.nav_gallery()}
			</a>
		</div>

		<div class="flex items-center gap-2">
			<div class="flex items-center gap-2" aria-label={m.nav_lang_switcher_aria()}>
				<button
					onclick={() => setLocale('pl')}
					class={`btn btn-sm paper-press-sm ${locale === 'pl' ? 'btn-primary' : 'btn-secondary'}`}
					aria-label={m.nav_lang_pl_aria()}
				>
					{m.nav_lang_pl_label()}
				</button>
				<button
					onclick={() => setLocale('en')}
					class={`btn btn-sm paper-press-sm ${locale === 'en' ? 'btn-primary' : 'btn-secondary'}`}
					aria-label={m.nav_lang_en_aria()}
				>
					{m.nav_lang_en_label()}
				</button>
			</div>

			<button class="btn btn-secondary btn-sm paper-press-sm" aria-label={m.nav_cart_aria()}>
				{m.nav_cart({ count: cartCount })}
			</button>

			{#if cartCount > 0}
				<button
					class="btn btn-coral btn-sm paper-press-sm"
					aria-label={m.nav_checkout_aria()}
					onclick={handleCheckoutClick}
				>
					{m.nav_checkout()}
				</button>
			{/if}
		</div>
	</nav>
</header>

{#if showToast}
	<div class="fixed right-6 bottom-6 z-50">
		<div class="brutal-card paper-shadow-md max-w-sm bg-coral p-6 text-paper">
			<h4 class="heading mb-2 text-lg">{m.checkout_toast_title()}</h4>
			<p class="body-small">{m.checkout_toast_desc()}</p>
		</div>
	</div>
{/if}

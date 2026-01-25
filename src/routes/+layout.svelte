<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { initMetaPixel, initGA4, trackMetaPageView, trackGA4PageView } from '$lib/tracking';
	import { getPageMetadata } from '$lib/config/routes';
	import { m } from '$lib/paraglide/messages';
	import LandingNav from '$lib/components/landing/LandingNav.svelte';
	import FooterSection from '$lib/components/landing/FooterSection.svelte';
	import PageHeader from '$lib/components/shared/PageHeader.svelte';
	import SEOHead from '$lib/components/shared/SEOHead.svelte';
	import { cart } from '$lib/stores/cart.svelte';
	import '../app.css';

	let { children } = $props();

	// Pages that should NOT show nav/header/footer (custom layouts)
	const customLayoutRoutes = ['/', '/shop', '/cart', '/order', '/gallery'];
	let isCustomLayout = $derived(
		customLayoutRoutes.some(route => {
			// Remove locale prefix if present (e.g., /en/shop -> /shop)
			const pathWithoutLocale = page.url.pathname.replace(/^\/(en|pl)/, '') || '/';
			return pathWithoutLocale === route;
		})
	);

	// Dynamically get page metadata for info pages (strip locale for lookup)
	let pathForMetadata = $derived(page.url.pathname.replace(/^\/(en|pl)/, '') || '/');
	let metadata = $derived(getPageMetadata(pathForMetadata));
	let pageTitle = $derived(metadata ? (m as any)[metadata.titleKey]?.() : '');
	let pageSubtitle = $derived(
		metadata?.subtitleKey ? (m as any)[metadata.subtitleKey]?.() : undefined
	);

	onMount(() => {
		initMetaPixel();
		initGA4();
	});

	// Track page views on client-side navigation
	$effect(() => {
		if (browser && page.url) {
			trackMetaPageView();
			trackGA4PageView(page.url.pathname, document.title);
		}
	});
</script>

<!-- Dynamic SEO meta tags with i18n support -->
<SEOHead />

<svelte:head>
	<meta name="theme-color" content="#faf6f1" />

	<!-- Fonts -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
</svelte:head>

<div class="app">
	{#if isCustomLayout}
		<!-- Pages with custom layouts (home, shop, cart, etc.) -->
		{@render children()}
	{:else}
		<!-- Info pages with shared layout -->
		<LandingNav cartCount={cart.count} />
		<PageHeader title={pageTitle} subtitle={pageSubtitle} />
		<main class="grow bg-cream py-16">
			<div class="fc-container">
				{@render children()}
			</div>
		</main>
		<FooterSection />
	{/if}
</div>

<!-- Hidden language switcher for i18n -->
<div style="display:none">
	{#each locales as locale (locale)}
		<a href={localizeHref(page.url.pathname, { locale })}>
			{locale}
		</a>
	{/each}
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
</style>

<script lang="ts">
	import { page } from '$app/state';
	import { getLocale } from '$lib/paraglide/runtime';
	import {
		getSEOMetadata,
		getFullUrl,
		getCanonicalUrl,
		SITE_CONFIG,
	} from '$lib/config/seo';

	interface Props {
		/** Override pathname (defaults to current page) */
		pathname?: string;
	}

	let { pathname = $bindable() }: Props = $props();

	// Get current pathname without locale prefix
	let currentPath = $derived(
		pathname || page.url.pathname.replace(/^\/(en|pl)/, '') || '/'
	);

	// Get current locale
	let locale = $derived(getLocale());

	// Get SEO metadata for current route and locale
	let seo = $derived(getSEOMetadata(currentPath, locale));

	// Generate URLs for all locales (for hreflang)
	let alternateUrls = $derived(
		SITE_CONFIG.locales.map((loc) => ({
			locale: loc,
			url: getFullUrl(currentPath, loc)
		}))
	);

	// Canonical URL (self-referential - each language version is its own canonical)
	let canonicalUrl = $derived(getFullUrl(currentPath, locale));

	// Open Graph locale codes
	let ogLocale = $derived(locale === 'pl' ? 'pl_PL' : 'en_US');
	let ogLocaleAlternate = $derived(locale === 'pl' ? 'en_US' : 'pl_PL');

	// Full URL for current page (for og:url)
	let currentUrl = $derived(getFullUrl(currentPath, locale));

	// OG Image with fallback
	let ogImage = $derived(
		seo.ogImage
			? `https://${SITE_CONFIG.domain}${seo.ogImage}`
			: `https://${SITE_CONFIG.domain}/og-image.png`
	);
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{seo.title}</title>
	<meta name="title" content={seo.title} />
	<meta name="description" content={seo.description} />
	{#if seo.keywords}
		<meta name="keywords" content={seo.keywords} />
	{/if}

	<!-- Canonical URL (self-referential for proper i18n SEO) -->
	<link rel="canonical" href={canonicalUrl} />

	<!-- Hreflang Tags (tell search engines about language alternates) -->
	{#each alternateUrls as alt}
		<link rel="alternate" hreflang={alt.locale} href={alt.url} />
	{/each}
	<!-- x-default points to Polish (default language) -->
	<link rel="alternate" hreflang="x-default" href={getFullUrl(currentPath, 'pl')} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta property="og:title" content={seo.title} />
	<meta property="og:description" content={seo.description} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:site_name" content={SITE_CONFIG.name} />
	<meta property="og:locale" content={ogLocale} />
	<meta property="og:locale:alternate" content={ogLocaleAlternate} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={currentUrl} />
	<meta name="twitter:title" content={seo.title} />
	<meta name="twitter:description" content={seo.description} />
	<meta name="twitter:image" content={ogImage} />

	<!-- Additional SEO -->
	<meta name="robots" content="index, follow" />
	<meta name="language" content={locale === 'pl' ? 'Polish' : 'English'} />
</svelte:head>

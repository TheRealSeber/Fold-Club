<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import { locales, localizeHref } from '$lib/paraglide/runtime';
  import { initMetaPixel, initGA4, trackMetaPageView, trackGA4PageView, consent } from '$lib/tracking';
  import { getPageMetadata } from '$lib/config/routes';
  import { m } from '$lib/paraglide/messages';
  import LandingNav from '$lib/components/landing/LandingNav.svelte';
  import FooterSection from '$lib/components/landing/FooterSection.svelte';
  import PageHeader from '$lib/components/shared/PageHeader.svelte';
  import SEOHead from '$lib/components/shared/SEOHead.svelte';
  import ConsentBanner from '$lib/components/tracking/ConsentBanner.svelte';
  import { cart } from '$lib/stores/cart.svelte';
  import '../app.css';

  let { children } = $props();

  // Pages that should NOT show PageHeader (home, shop children, product pages have custom layouts)
  let shouldShowPageHeader = $derived(() => {
    const pathWithoutLocale = page.url.pathname.replace(/^\/(en|pl)/, '') || '/';
    const isHome = pathWithoutLocale === '/';
    const isShopChild =
      pathWithoutLocale.startsWith('/shop/') || pathWithoutLocale.startsWith('/sklep/');
    const isProductPage =
      pathWithoutLocale.startsWith('/products/') || pathWithoutLocale.startsWith('/produkty/');

    // Exclude home, shop children (landing pages), and product pages - they have custom layouts
    return !isHome && !isShopChild && !isProductPage;
  });

  // Dynamically get page metadata for pages with headers
  let pathForMetadata = $derived(page.url.pathname.replace(/^\/(en|pl)/, '') || '/');
  let metadata = $derived(getPageMetadata(pathForMetadata));
  let pageTitle = $derived(metadata ? (m as any)[metadata.titleKey]?.() : '');
  let pageSubtitle = $derived(
    metadata?.subtitleKey ? (m as any)[metadata.subtitleKey]?.() : undefined
  );

  // Initialize tracking based on consent
  $effect(() => {
    if (browser) {
      if (consent.marketing) {
        initMetaPixel();
      }
      if (consent.analytics) {
        initGA4();
      }
    }
  });

  // Track page views on client-side navigation (only if consented)
  $effect(() => {
    if (browser && page.url) {
      if (consent.marketing) {
        trackMetaPageView();
      }
      if (consent.analytics) {
        trackGA4PageView(page.url.pathname, document.title);
      }
    }
  });
</script>

<!-- Dynamic SEO meta tags with i18n support -->
<SEOHead />

<svelte:head>
  <meta name="theme-color" content="#faf6f1" />

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
</svelte:head>

<div class="app">
  <!-- Navigation appears on all pages -->
  <LandingNav cartCount={cart.count} />

  <!-- Page header appears on all pages except home (which has HeroSection instead) -->
  {#if shouldShowPageHeader()}
    <PageHeader title={pageTitle} subtitle={pageSubtitle} />
    <!-- Wrap info pages with main container -->
    <main class="grow bg-cream py-16">
      <div class="fc-container">
        {@render children()}
      </div>
    </main>
  {:else}
    <!-- Home page has custom layout with HeroSection and multiple landing sections -->
    {@render children()}
  {/if}

  <!-- Footer appears on all pages -->
  <FooterSection />

  <!-- GDPR consent banner -->
  <ConsentBanner />
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

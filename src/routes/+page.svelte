<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import LandingNav from '$lib/components/landing/LandingNav.svelte';
	import HeroSection from '$lib/components/landing/HeroSection.svelte';
	import StatsBar from '$lib/components/landing/StatsBar.svelte';
	import ProductsSection from '$lib/components/landing/ProductsSection.svelte';
	import HowItWorksSection from '$lib/components/landing/HowItWorksSection.svelte';
	import CtaSection from '$lib/components/landing/CtaSection.svelte';
	import FooterSection from '$lib/components/landing/FooterSection.svelte';
	import HowItWorksDialog from '$lib/components/landing/HowItWorksDialog.svelte';
	import { cart } from '$lib/stores/cart.svelte';

	let dialogOpen = $state(false);

	const steps = [
		{ num: '01', title: m.step_punch_title, desc: m.step_punch_desc },
		{ num: '02', title: m.step_fold_title, desc: m.step_fold_desc },
		{ num: '03', title: m.step_glue_title, desc: m.step_glue_desc },
		{ num: '04', title: m.step_admire_title, desc: m.step_admire_desc }
	];
</script>

<!-- SEO handled by SEOHead component in +layout.svelte -->

<LandingNav cartCount={cart.count} />
<HeroSection onOpenHowItWorks={() => (dialogOpen = true)} />
<StatsBar />
<ProductsSection />
<HowItWorksSection {steps} />
<CtaSection />
<FooterSection />
<HowItWorksDialog bind:open={dialogOpen} {steps} />

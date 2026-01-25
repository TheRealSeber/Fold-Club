<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages';
	import LandingNav from '$lib/components/landing/LandingNav.svelte';
	import HeroSection from '$lib/components/landing/HeroSection.svelte';
	import StatsBar from '$lib/components/landing/StatsBar.svelte';
	import ProductsSection from '$lib/components/landing/ProductsSection.svelte';
	import HowItWorksSection from '$lib/components/landing/HowItWorksSection.svelte';
	import CtaSection from '$lib/components/landing/CtaSection.svelte';
	import FooterSection from '$lib/components/landing/FooterSection.svelte';
	import HowItWorksDialog from '$lib/components/landing/HowItWorksDialog.svelte';
	import { cart } from '$lib/stores/cart.svelte.ts';
	import { analytics } from '$lib/stores/analytics';

	let dialogOpen = $state(false);

	onMount(() => {
		analytics.trackPageView('home');
	});

	// New products: Swans (couples), Moai (meme), Baby Dino (kids), Skull (universal)
	// Pricing based on size/complexity
	const products = [
		{
			id: 1,
			name: m.product_name_swans,
			description: m.product_desc_swans,
			price: 69, // Medium price - couples product
			difficulty: m.product_difficulty_medium,
			time: m.product_time_2_3,
			tag: m.product_tag_date_night,
			tagColor: 'coral'
		},
		{
			id: 2,
			name: m.product_name_moai,
			description: m.product_desc_moai,
			price: 59, // Medium-low - popular meme item
			difficulty: m.product_difficulty_medium,
			time: m.product_time_2_3,
			tag: m.product_tag_iconic,
			tagColor: 'mint'
		},
		{
			id: 3,
			name: m.product_name_dino,
			description: m.product_desc_dino,
			price: 39, // Lowest - simple, for kids
			difficulty: m.product_difficulty_easy,
			time: m.product_time_1_2,
			tag: m.product_tag_kids,
			tagColor: 'gold'
		},
		{
			id: 4,
			name: m.product_name_skull,
			description: m.product_desc_skull,
			price: 89, // Highest - complex, statement piece
			difficulty: m.product_difficulty_hard,
			time: m.product_time_4_5,
			tag: m.product_tag_masterpiece,
			tagColor: 'violet'
		}
	];

	// Updated steps: PUNCH, FOLD, GLUE, DISPLAY (no cutting needed)
	const steps = [
		{ num: '01', title: m.step_punch_title, desc: m.step_punch_desc },
		{ num: '02', title: m.step_fold_title, desc: m.step_fold_desc },
		{ num: '03', title: m.step_glue_title, desc: m.step_glue_desc },
		{ num: '04', title: m.step_admire_title, desc: m.step_admire_desc }
	];
</script>

<svelte:head>
	<title>{m.page_title()}</title>
</svelte:head>

<LandingNav cartCount={cart.count} />
<HeroSection onOpenHowItWorks={() => (dialogOpen = true)} />
<StatsBar />
<ProductsSection {products} />
<HowItWorksSection {steps} />
<CtaSection />
<FooterSection />
<HowItWorksDialog bind:open={dialogOpen} {steps} />

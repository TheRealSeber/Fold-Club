<script lang="ts">
	import LandingNav from '$lib/components/landing/LandingNav.svelte';
	import FooterSection from '$lib/components/landing/FooterSection.svelte';
	import PageHeader from './PageHeader.svelte';
	import { cart } from '$lib/stores/cart.svelte';

	type Props = {
		title: string;
		subtitle?: string;
		children?: import('svelte').Snippet;
	};

	let { title, subtitle, children }: Props = $props();
</script>

<div class="flex min-h-screen flex-col">
	<LandingNav cartCount={cart.count} />
	<PageHeader {title} {subtitle} />
	<main class="grow bg-cream py-16">
		<div class="fc-container">
			{@render children?.()}
		</div>
	</main>
	<FooterSection />
</div>

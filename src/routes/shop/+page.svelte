<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import LandingNav from '$lib/components/landing/LandingNav.svelte';
	import FooterSection from '$lib/components/landing/FooterSection.svelte';
	import PageHeader from '$lib/components/shared/PageHeader.svelte';
	import { m } from '$lib/paraglide/messages';
	import { cart } from '$lib/stores/cart.svelte.ts';
	import { analytics } from '$lib/stores/analytics';

	type Product = {
		id: number;
		name: () => string;
		description: () => string;
		price: number;
		difficulty: () => string;
		time: () => string;
		tag: () => string;
		tagColor: string;
		category: string;
	};

	const products: Product[] = [
		{
			id: 1,
			name: () => m.product_name_swans(),
			description: () => m.product_desc_swans(),
			price: 79,
			difficulty: () => m.product_difficulty_easy(),
			time: () => m.product_time_2_3(),
			tag: () => m.product_tag_date_night(),
			tagColor: 'coral',
			category: 'couples'
		},
		{
			id: 2,
			name: () => m.product_name_moai(),
			description: () => m.product_desc_moai(),
			price: 69,
			difficulty: () => m.product_difficulty_medium(),
			time: () => m.product_time_3_4(),
			tag: () => m.product_tag_iconic(),
			tagColor: 'gold',
			category: 'statement'
		},
		{
			id: 3,
			name: () => m.product_name_dino(),
			description: () => m.product_desc_dino(),
			price: 59,
			difficulty: () => m.product_difficulty_easy(),
			time: () => m.product_time_1_2(),
			tag: () => m.product_tag_kids(),
			tagColor: 'mint',
			category: 'kids'
		},
		{
			id: 4,
			name: () => m.product_name_skull(),
			description: () => m.product_desc_skull(),
			price: 99,
			difficulty: () => m.product_difficulty_hard(),
			time: () => m.product_time_4_5(),
			tag: () => m.product_tag_masterpiece(),
			tagColor: 'violet',
			category: 'statement'
		}
	];

	let activeCategory = $derived($page.url.searchParams.get('category') || 'all');

	let filteredProducts = $derived(
		activeCategory === 'all' ? products : products.filter((p) => p.category === activeCategory)
	);

	const filters = [
		{ key: 'all', label: () => m.shop_filter_all() },
		{ key: 'couples', label: () => m.shop_filter_couples() },
		{ key: 'kids', label: () => m.shop_filter_kids() },
		{ key: 'statement', label: () => m.shop_filter_statement() }
	];

	const formatPrice = (value: number) =>
		new Intl.NumberFormat('pl-PL', {
			style: 'currency',
			currency: 'PLN',
			maximumFractionDigits: 0
		}).format(value);

	function handleAddToCart(productId: number) {
		cart.addToCart(productId);
		analytics.trackAddToCart(productId);
	}

	function handleProductClick(productId: number) {
		analytics.trackProductView(productId);
	}

	onMount(() => {
		analytics.trackPageView('shop');
	});
</script>

<div class="flex min-h-screen flex-col">
	<LandingNav cartCount={cart.count} />
	<PageHeader title={m.shop_title()} subtitle={m.shop_subtitle()} />

	<main class="flex-grow bg-cream py-16">
		<div class="fc-container">
			<div class="mb-12 flex flex-wrap gap-3">
				{#each filters as filter (filter.key)}
					<a
						href="?category={filter.key}"
						class={`btn btn-sm paper-press-sm ${activeCategory === filter.key ? 'btn-primary' : 'btn-secondary'}`}
					>
						{filter.label()}
					</a>
				{/each}
			</div>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				{#each filteredProducts as product (product.id)}
					<div
						class="brutal-card paper-press group flex cursor-pointer flex-col"
						onclick={() => handleProductClick(product.id)}
						onkeydown={(e) => e.key === 'Enter' && handleProductClick(product.id)}
						role="button"
						tabindex="0"
					>
						<div
							class="relative mb-4 flex aspect-square items-center justify-center overflow-hidden border-b-3 border-ink bg-cream-deep"
						>
							<div class="heading text-6xl text-ink/10 group-hover:text-ink/20">
								{product.name().charAt(0)}
							</div>
							<span class={`tag tag-${product.tagColor} absolute top-3 left-3`}>
								{product.tag()}
							</span>
						</div>

						<div class="flex flex-grow flex-col gap-3">
							<h3 class="heading text-xl">{product.name()}</h3>
							<p class="body-small text-ink-muted">{product.description()}</p>

							<div class="mt-auto space-y-3">
								<div class="flex items-center gap-4 text-ink-muted">
									<span class="label">{product.difficulty()}</span>
									<span class="label">{product.time()}</span>
								</div>

								<div class="flex items-center justify-between border-t-2 border-ink/20 pt-3">
									<div class="price">{formatPrice(product.price)}</div>
									<button
										class="btn btn-primary btn-sm"
										aria-label={m.product_add_aria({ name: product.name() })}
										onclick={(e) => {
											e.stopPropagation();
											handleAddToCart(product.id);
										}}
									>
										{m.product_add()}
									</button>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</main>

	<FooterSection />
</div>

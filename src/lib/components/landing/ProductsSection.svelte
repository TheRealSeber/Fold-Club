<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime';
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
	};

	type Props = {
		products: Product[];
	};

	let { products }: Props = $props();

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
</script>

<section class="bg-cream-warm py-20">
	<div class="fc-container">
		<div class="mb-12 flex items-end justify-between">
			<div>
				<span class="label mb-2 block text-coral">{m.collection_label()}</span>
				<h2 class="heading-2">{m.collection_title()}</h2>
			</div>
			<a
				href={localizeHref('/shop')}
				class="btn btn-secondary btn-sm paper-press-sm hidden md:flex"
			>
				{m.collection_view_all()}
			</a>
		</div>

		<div class="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-4">
			{#each products as product (product.id)}
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
</section>

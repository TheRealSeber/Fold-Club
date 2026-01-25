<script lang="ts">
  import { page } from '$app/stores';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import { m } from '$lib/paraglide/messages';
  import { products, getProductsByCategory } from '$lib/data/products';

  let activeCategory = $derived($page.url.searchParams.get('category') || 'all');
  let filteredProducts = $derived(getProductsByCategory(activeCategory));

  const filters = [
    { key: 'all', label: () => m.shop_filter_all() },
    { key: 'couples', label: () => m.shop_filter_couples() },
    { key: 'kids', label: () => m.shop_filter_kids() },
    { key: 'statement', label: () => m.shop_filter_statement() }
  ];
</script>

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
	<ProductCard {product} />
	{/each}
</div>

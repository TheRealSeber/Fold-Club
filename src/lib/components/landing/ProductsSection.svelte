<script lang="ts">
  import { localizeHref } from '$lib/paraglide/runtime';
  import { m } from '$lib/paraglide/messages';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import type { ProductWithTranslation } from '$lib/server/db/products';

  let { products }: { products: ProductWithTranslation[] } = $props();
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
        <ProductCard {product} />
      {/each}
    </div>
  </div>
</section>

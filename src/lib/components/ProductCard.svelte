<script lang="ts">
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { cart } from '$lib/stores/cart.svelte';
  import { trackAddToCart } from '$lib/tracking';
  import { formatPrice } from '$lib/utils/format';
  import type { ProductWithTranslation } from '$lib/server/db/products';

  interface Props {
    product: ProductWithTranslation;
  }

  let { product }: Props = $props();

  let productUrl = $derived(localizeHref(`/products/${product.localizedSlug}`));

  const difficultyLabels = {
    easy: m.product_difficulty_easy,
    medium: m.product_difficulty_medium,
    hard: m.product_difficulty_hard
  };
  const timeLabels = {
    '1-2': m.product_time_1_2,
    '2-3': m.product_time_2_3,
    '3-4': m.product_time_3_4
  };

  function handleAddToCart(e: Event) {
    e.preventDefault();
    e.stopPropagation();

    // 1. Fire all tracking events IMMEDIATELY (before any UI updates)
    trackAddToCart(product.id, product.name, product.priceAmount);

    // 2. Add to cart (for UI state)
    cart.addToCart(product.id);
  }
</script>

<a href={productUrl} class="brutal-card paper-press-hover group flex cursor-pointer flex-col">
  <div
    class="relative mb-4 flex aspect-square items-center justify-center overflow-hidden border-b-3 border-ink bg-cream-deep"
  >
    <div class="heading text-6xl text-ink/10 group-hover:text-ink/20">
      {product.name.charAt(0)}
    </div>
    <span class={`tag tag-${product.tagColor} absolute top-3 left-3`}>
      {product.tag}
    </span>
  </div>

  <div class="flex grow flex-col gap-3">
    <h3 class="heading text-xl">{product.name}</h3>
    <p class="body-small text-ink-muted">{product.description}</p>

    <div class="mt-auto space-y-3">
      <div class="flex items-center gap-4 text-ink-muted">
        <span class="label">{difficultyLabels[product.difficulty]()}</span>
        <span class="label">{timeLabels[product.timeEstimate]()}</span>
      </div>

      <div class="flex items-center justify-between border-t-2 border-ink/20 pt-3">
        <div class="price">{formatPrice(product.priceAmount)}</div>
        <button
          class="btn btn-primary btn-sm paper-press"
          aria-label={m.product_add_aria({ name: product.name })}
          onclick={handleAddToCart}
        >
          {m.product_add()}
        </button>
      </div>
    </div>
  </div>
</a>

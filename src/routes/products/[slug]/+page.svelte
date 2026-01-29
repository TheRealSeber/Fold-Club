<script lang="ts">
  import { page } from '$app/state';
  import { getLocale } from '$lib/paraglide/runtime';
  import { getProductBySlug, formatPrice } from '$lib/data/products';
  import { m } from '$lib/paraglide/messages';
  import { cart } from '$lib/stores/cart.svelte';
  import { trackAddToCart } from '$lib/tracking';

  let slug = $derived(page.params.slug);
  let locale = $derived(getLocale());
  let product = $derived(getProductBySlug(slug!, locale));

  function handleAddToCart() {
    if (!product) return;
    trackAddToCart(product.id, product.name(), product.price);
    cart.addToCart(product.id);
  }
</script>

{#if product}
  <div class="fc-container py-16">
    <div class="grid gap-8 lg:grid-cols-2">
      <!-- Product Image Placeholder -->
      <div class="brutal-card paper-shadow-md aspect-square flex items-center justify-center bg-cream-deep">
        <div class="heading text-9xl text-ink/10">
          {product.name().charAt(0)}
        </div>
      </div>

      <!-- Product Details -->
      <div class="flex flex-col gap-6">
        <div>
          <span class={`tag tag-${product.tagColor} mb-3 inline-block`}>
            {product.tag()}
          </span>
          <h1 class="heading-1 mb-4">{product.name()}</h1>
          <p class="body-large text-ink-muted">{product.description()}</p>
        </div>

        <div class="flex gap-6">
          <div>
            <div class="label text-ink-muted">{m.product_detail_difficulty_label()}</div>
            <div class="body">{product.difficulty()}</div>
          </div>
          <div>
            <div class="label text-ink-muted">{m.product_detail_time_label()}</div>
            <div class="body">{product.time()}</div>
          </div>
        </div>

        <div class="mt-auto space-y-4">
          <div class="flex items-center justify-between border-t-3 border-ink pt-4">
            <div class="heading-2">{formatPrice(product.price)}</div>
            <button
              class="btn btn-primary paper-press"
              onclick={handleAddToCart}
            >
              {m.product_detail_add_to_cart()}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="fc-container py-16 text-center">
    <h1 class="heading-1 mb-4">{m.product_detail_not_found()}</h1>
    <a href="/" class="btn btn-primary paper-press mt-6 inline-block">
      {m.product_detail_back_to_shop()}
    </a>
  </div>
{/if}

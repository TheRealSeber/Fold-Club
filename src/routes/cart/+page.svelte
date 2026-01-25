<script lang="ts">
  import { AlertDialog } from 'bits-ui';
  import FakeDoorModal from '$lib/components/shared/FakeDoorModal.svelte';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { m } from '$lib/paraglide/messages';
  import { cart } from '$lib/stores/cart.svelte';
  import { trackCheckoutClick } from '$lib/tracking';
  import { getProductById, formatPrice } from '$lib/data/products';

  let showFakeDoor = $state(false);
  let showRemoveConfirm = $state(false);
  let pendingRemoveId = $state<number | null>(null);

  // Check if removing this item would empty the cart
  let isLastItem = $derived(cart.items.length === 1 && pendingRemoveId !== null);

  let cartTotal = $derived(
    cart.items.reduce((sum, item) => {
      const product = getProductById(item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0)
  );

  // Build cart items for tracking
  let cartItemsForTracking = $derived(
    cart.items
      .map((item) => {
        const product = getProductById(item.productId);
        if (!product) return null;
        return {
          id: product.id,
          name: product.name(),
          price: product.price,
          quantity: item.quantity
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  );

  function handleRemove(productId: number) {
    // Always show confirmation when removing an item
    pendingRemoveId = productId;
    showRemoveConfirm = true;
  }

  function confirmRemove() {
    if (pendingRemoveId !== null) {
      cart.removeFromCart(pendingRemoveId);
      pendingRemoveId = null;
    }
    showRemoveConfirm = false;
  }

  function cancelRemove() {
    pendingRemoveId = null;
    showRemoveConfirm = false;
  }

  function handleQuantityChange(productId: number, delta: number) {
    const item = cart.items.find((i) => i.productId === productId);
    if (item) {
      // If decreasing to 0 (last quantity), show confirmation
      if (delta < 0 && item.quantity + delta <= 0) {
        pendingRemoveId = productId;
        showRemoveConfirm = true;
        return;
      }
      cart.updateQuantity(productId, item.quantity + delta);
    }
  }

  function handleCheckoutClick(e: Event) {
    e.preventDefault();

    // Fire tracking events IMMEDIATELY (before showing modal)
    trackCheckoutClick(cartItemsForTracking, cartTotal);

    // Show Fake Door modal instead of navigating
    showFakeDoor = true;
  }
</script>

    {#if cart.items.length === 0}
      <div class="brutal-card paper-shadow-md p-12 text-center">
        <div class="heading mb-4 text-6xl text-ink/20">:(</div>
        <h2 class="heading-2 mb-4">{m.cart_empty_title()}</h2>
        <p class="body mb-8 text-ink-muted">{m.cart_empty_desc()}</p>
        <a href={localizeHref('/shop')} class="btn btn-primary paper-press">
          {m.cart_browse_shop()}
        </a>
      </div>
    {:else}
      <div class="grid gap-6 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
          {#each cart.items as item (item.productId)}
            {@const product = getProductById(item.productId)}
            {#if product}
              <div
                class="brutal-card paper-shadow-sm flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-6 sm:p-6"
              >
                <div class="flex items-center gap-3 sm:gap-4">
                  <div
                    class="flex h-16 w-16 shrink-0 items-center justify-center border-3 border-ink bg-cream-deep sm:h-20 sm:w-20"
                  >
                    <span class="heading text-2xl text-ink/20 sm:text-3xl">
                      {product.name().charAt(0)}
                    </span>
                  </div>

                  <div class="min-w-0 grow sm:grow-0">
                    <h3 class="heading text-base sm:text-lg">{product.name()}</h3>
                    <p class="body-small text-ink-muted">{formatPrice(product.price)}</p>
                  </div>
                </div>

                <div class="flex items-center justify-between gap-4 sm:ml-auto sm:gap-4">
                  <div class="flex items-center gap-2">
                    <button
                      class="btn btn-secondary btn-sm paper-press-sm"
                      onclick={() => handleQuantityChange(item.productId, -1)}
                      aria-label={m.cart_decrease_aria()}
                    >
                      -
                    </button>
                    <span class="heading w-6 text-center sm:w-8">{item.quantity}</span>
                    <button
                      class="btn btn-secondary btn-sm paper-press-sm"
                      onclick={() => handleQuantityChange(item.productId, 1)}
                      aria-label={m.cart_increase_aria()}
                    >
                      +
                    </button>
                  </div>

                  <div class="heading flex-1 text-right sm:flex-none">
                    {formatPrice(product.price * item.quantity)}
                  </div>

                  <button
                    class="btn btn-secondary btn-sm paper-press-sm text-coral"
                    onclick={() => handleRemove(item.productId)}
                    aria-label={m.cart_remove_aria()}
                  >
                    X
                  </button>
                </div>
              </div>
            {/if}
          {/each}
        </div>

        <div class="lg:col-span-1">
          <div class="brutal-card paper-shadow-md p-4 sm:p-8 lg:sticky lg:top-24">
            <h3 class="heading-2 mb-6">{m.cart_summary()}</h3>

            <div class="mb-6 space-y-3">
              <div class="flex justify-between items-center">
                <span class="body text-ink-muted">{m.cart_subtotal()}</span>
                <span class="heading">{formatPrice(cartTotal)}</span>
              </div>
              <div class="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center">
                <span class="body-small sm:body text-ink-muted">{m.cart_shipping()}</span>
                <span class="body-small sm:body text-ink-muted">{m.cart_shipping_calculated()}</span>
              </div>
            </div>

            <div class="mb-8 flex justify-between items-center border-t-3 border-ink pt-4">
              <span class="heading">{m.cart_total()}</span>
              <span class="heading text-xl">{formatPrice(cartTotal)}</span>
            </div>

            <button
              class="btn btn-primary paper-press text-center"
              onclick={handleCheckoutClick}
            >
              {m.cart_checkout()}
            </button>

            <a
              href={localizeHref('/shop')}
              class="btn btn-secondary paper-press-sm mt-4 w-full text-center"
            >
              {m.cart_continue_shopping()}
            </a>
          </div>
        </div>
      </div>
    {/if}

<FakeDoorModal bind:open={showFakeDoor} />

<!-- Remove Last Item Confirmation Dialog -->
<AlertDialog.Root bind:open={showRemoveConfirm}>
  <AlertDialog.Portal>
    <AlertDialog.Overlay class="fixed inset-0 z-40 bg-ink/80" />
    <AlertDialog.Content
      class="brutal-card paper-shadow-xl fixed top-1/2 left-1/2 z-50 max-w-md -translate-x-1/2 -translate-y-1/2 bg-paper p-8"
    >
      <div class="heading mb-4 text-center text-6xl text-coral">⚠</div>

      <AlertDialog.Title class="heading-2 mb-4 text-center">
        {isLastItem ? m.cart_remove_last_title() : m.cart_remove_title()}
      </AlertDialog.Title>

      <AlertDialog.Description class="body mb-8 text-center text-ink-muted">
        {isLastItem ? m.cart_remove_last_confirm() : m.cart_remove_confirm_msg()}
      </AlertDialog.Description>

      <div class="flex gap-3">
        <AlertDialog.Cancel class="btn btn-secondary paper-press-sm flex-1" onclick={cancelRemove}>
          {m.cart_remove_cancel()}
        </AlertDialog.Cancel>
        <AlertDialog.Action
          class="btn btn-primary paper-press flex-1 bg-coral"
          onclick={confirmRemove}
        >
          {m.cart_remove_confirm()}
        </AlertDialog.Action>
      </div>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>

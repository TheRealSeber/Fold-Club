<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { m } from '$lib/paraglide/messages';
  import { cart } from '$lib/stores/cart.svelte';
  import FakeDoorModal from '$lib/components/shared/FakeDoorModal.svelte';
  import { trackGA4ViewCheckout, trackGA4PaymentClick } from '$lib/tracking';
  import { getProductById, formatPrice } from '$lib/data/products';

  let showFakeDoor = $state(false);

  // Form state
  let formData = $state({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Polska'
  });

  // Cart calculations
  let cartTotal = $derived(
    cart.items.reduce((sum, item) => {
      const product = getProductById(item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0)
  );

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

  // Redirect to cart if empty
  onMount(() => {
    if (cart.items.length === 0) {
      goto(localizeHref('/cart'));
      return;
    }

    // Track checkout page view
    trackGA4ViewCheckout(cartItemsForTracking, cartTotal);
  });

  function handlePaymentClick(e: Event) {
    e.preventDefault();

    // Track payment button click BEFORE showing modal
    trackGA4PaymentClick(cartItemsForTracking, cartTotal);

    // Show fake door modal
    showFakeDoor = true;
  }
</script>

<div class="mx-auto max-w-6xl">
  <div class="brutal-card paper-shadow-md mb-8 bg-mint p-4">
    <p class="body text-center text-ink">
      <span class="heading">✓</span>
      {m.checkout_secure_connection()}
    </p>
  </div>

  <div class="grid gap-8 lg:grid-cols-3">
    <!-- Address Form -->
    <div class="lg:col-span-2">
      <div class="brutal-card paper-shadow-md p-6 sm:p-8">
        <h2 class="heading-2 mb-8">{m.checkout_shipping_title()}</h2>

        <form class="space-y-6">
          <!-- Name Row -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="firstName" class="label mb-2 block">{m.checkout_first_name()}</label>
              <input
                id="firstName"
                type="text"
                bind:value={formData.firstName}
                class="brutal-input w-full"
                required
              />
            </div>
            <div>
              <label for="lastName" class="label mb-2 block">{m.checkout_last_name()}</label>
              <input
                id="lastName"
                type="text"
                bind:value={formData.lastName}
                class="brutal-input w-full"
                required
              />
            </div>
          </div>

          <!-- Contact Row -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="email" class="label mb-2 block">{m.checkout_email()}</label>
              <input
                id="email"
                type="email"
                bind:value={formData.email}
                class="brutal-input w-full"
                required
              />
            </div>
            <div>
              <label for="phone" class="label mb-2 block">{m.checkout_phone()}</label>
              <input
                id="phone"
                type="tel"
                bind:value={formData.phone}
                class="brutal-input w-full"
                required
              />
            </div>
          </div>

          <!-- Address -->
          <div>
            <label for="street" class="label mb-2 block">{m.checkout_street()}</label>
            <input
              id="street"
              type="text"
              bind:value={formData.street}
              class="brutal-input w-full"
              required
            />
          </div>

          <!-- City & Postal -->
          <div class="grid gap-4 sm:grid-cols-3">
            <div class="sm:col-span-2">
              <label for="city" class="label mb-2 block">{m.checkout_city()}</label>
              <input
                id="city"
                type="text"
                bind:value={formData.city}
                class="brutal-input w-full"
                required
              />
            </div>
            <div>
              <label for="postalCode" class="label mb-2 block">{m.checkout_postal()}</label>
              <input
                id="postalCode"
                type="text"
                bind:value={formData.postalCode}
                class="brutal-input w-full"
                placeholder="00-000"
                required
              />
            </div>
          </div>

          <!-- Country -->
          <div>
            <label for="country" class="label mb-2 block">{m.checkout_country()}</label>
            <select id="country" bind:value={formData.country} class="brutal-input w-full" required>
              <option value="Polska">Polska</option>
              <option value="Germany">Germany</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="France">France</option>
              <option value="Spain">Spain</option>
            </select>
          </div>
        </form>
      </div>
    </div>

    <!-- Order Summary & Payment -->
    <div class="lg:col-span-1">
      <div class="brutal-card paper-shadow-md p-6 lg:sticky lg:top-24">
        <h3 class="heading-2 mb-6">{m.checkout_order_summary()}</h3>

        <!-- Cart Items -->
        <div class="mb-6 space-y-3">
          {#each cart.items as item (item.productId)}
            {@const product = getProductById(item.productId)}
            {#if product}
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <p class="body text-ink">{product.name()}</p>
                  <p class="body-small text-ink-muted">
                    {m.checkout_quantity()}: {item.quantity}
                  </p>
                </div>
                <span class="heading">{formatPrice(product.price * item.quantity)}</span>
              </div>
            {/if}
          {/each}
        </div>

        <!-- Totals -->
        <div class="mb-6 space-y-2 border-t-3 border-ink pt-4">
          <div class="flex items-center justify-between">
            <span class="body text-ink-muted">{m.checkout_subtotal()}</span>
            <span class="heading">{formatPrice(cartTotal)}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="body text-ink-muted">{m.checkout_shipping()}</span>
            <span class="body text-ink-muted">{m.checkout_shipping_calculated()}</span>
          </div>
        </div>

        <div class="mb-8 flex items-center justify-between border-t-3 border-ink pt-4">
          <span class="heading">{m.checkout_total()}</span>
          <span class="heading text-xl">{formatPrice(cartTotal)}</span>
        </div>

        <!-- Przelewy24 Payment Button -->
        <button
          class="flex flex-col gap-2 brutal-card paper-press cursor-pointer w-full overflow-hidden border-3 border-ink bg-white p-0 transition-transform"
          onclick={handlePaymentClick}
          aria-label={m.checkout_pay_with_przelewy24()}
        >
          <span class="heading text-sm">{m.checkout_pay_now()}</span>
          <img
            src="/assets/Przelewy24_logo.png"
            alt="Przelewy24"
            class="h-8 w-auto object-contain"
          />
        </button>

        <p class="body-small mt-4 text-center text-ink-muted">{m.checkout_secure_payment()}</p>

        <a
          href={localizeHref('/cart')}
          class="btn btn-secondary paper-press-sm mt-6 w-full text-center"
        >
          {m.checkout_back_to_cart()}
        </a>
      </div>
    </div>
  </div>
</div>

<FakeDoorModal bind:open={showFakeDoor} />

<style>
  .brutal-input {
    width: 100%;
    border: 3px solid var(--color-ink);
    background: var(--color-paper);
    padding: 0.75rem 1rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    color: var(--color-ink);
    transition: none;
  }

  .brutal-input:focus {
    outline: none;
    border-color: var(--color-ink);
    box-shadow: 3px 3px 0 var(--color-ink);
  }

  .brutal-input::placeholder {
    color: var(--color-ink-muted);
  }
</style>

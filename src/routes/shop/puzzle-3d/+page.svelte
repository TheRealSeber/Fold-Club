<script lang="ts">
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import ProductCard from '$lib/components/ProductCard.svelte';

  let { data } = $props();
</script>

<!-- SEO handled by global SEOHead component in layout -->
<!-- BRUTALIST DESIGN - NO ROUNDED CORNERS -->
<main class="bg-cream">
  <!-- Hero Section -->
  <section class="bg-cream py-16">
    <div class="fc-container">
      <div class="paper-shadow-lg border-3 border-ink bg-paper p-8 md:p-12">
        <span class="tag tag-coral mb-4 inline-block">
          {m.landing_puzzle3d_title()}
        </span>

        <h1 class="heading-1 mb-4">
          {m.landing_puzzle3d_title()}
        </h1>

        <p class="body mb-6 max-w-2xl text-ink-soft">
          {m.landing_puzzle3d_description()}
        </p>

        <!-- Stats/Features Grid -->
        <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="border-2 border-ink bg-cream p-4">
            <div class="mb-1 text-2xl font-bold text-ink">{m.landing_stat_precut()}</div>
            <div class="text-sm text-ink-muted">{m.landing_stat_precut_desc()}</div>
          </div>
          <div class="border-2 border-ink bg-cream p-4">
            <div class="mb-1 text-2xl font-bold text-ink">{m.landing_stat_models()}</div>
            <div class="text-sm text-ink-muted">{m.landing_stat_models_desc()}</div>
          </div>
          <div class="border-2 border-ink bg-cream p-4">
            <div class="mb-1 text-2xl font-bold text-ink">{m.landing_stat_time()}</div>
            <div class="text-sm text-ink-muted">{m.landing_stat_time_desc()}</div>
          </div>
          <div class="border-2 border-ink bg-cream p-4">
            <div class="mb-1 text-2xl font-bold text-ink">{m.landing_stat_3d()}</div>
            <div class="text-sm text-ink-muted">{m.landing_stat_3d_desc()}</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Products Grid -->
  <section class="bg-cream-warm py-16">
    <div class="fc-container">
      <h2 class="heading-2 mb-8 text-center">
        {m.landing_all_models()}
      </h2>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {#each data.products as product (product.id)}
          <ProductCard {product} />
        {/each}
      </div>
    </div>
  </section>

  <!-- SEO Content Section -->
  <section class="bg-cream py-16">
    <div class="fc-container max-w-4xl">
      <div class="paper-shadow-md border-3 border-ink bg-paper p-8 md:p-12">
        <h2 class="heading-2 mb-6">
          {m.landing_puzzle3d_content_title()}
        </h2>

        <div class="body space-y-6">
          <p class="text-ink-soft">
            {m.landing_puzzle3d_content_p1()}
          </p>

          <p class="font-bold text-ink">
            {m.landing_puzzle3d_content_p2()}
          </p>

          <ul class="ml-6 space-y-4">
            <li class="flex items-start gap-3">
              <span class="text-xl font-bold text-coral">→</span>
              <div>
                <span class="font-bold text-ink">Pre-cut</span>
                <span class="text-ink-soft"> - {m.landing_puzzle3d_feature1()}</span>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-xl font-bold text-mint">→</span>
              <div>
                <span class="font-bold text-ink">{m.landing_stat_precut()}</span>
                <span class="text-ink-soft"> - {m.landing_puzzle3d_feature2()}</span>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-xl font-bold text-gold">→</span>
              <div>
                <span class="font-bold text-ink">Polygon art</span>
                <span class="text-ink-soft"> - {m.landing_puzzle3d_feature3()}</span>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-xl font-bold text-violet">→</span>
              <div>
                <span class="font-bold text-ink">{m.landing_stat_models()}</span>
                <span class="text-ink-soft"> - {m.landing_puzzle3d_feature4()}</span>
              </div>
            </li>
          </ul>

          <!-- Process Steps -->
          <div class="mt-8 border-t-3 border-ink pt-8">
            <h3 class="heading-2 mb-6 text-xl">
              {m.product_detail_how_it_works()}
            </h3>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div class="border-2 border-ink bg-cream p-4">
                <div class="label mb-2">01. {m.step_punch_title()}</div>
                <p class="text-sm text-ink-soft">{m.step_punch_desc()}</p>
              </div>
              <div class="border-2 border-ink bg-cream p-4">
                <div class="label mb-2">02. {m.step_fold_title()}</div>
                <p class="text-sm text-ink-soft">{m.step_fold_desc()}</p>
              </div>
              <div class="border-2 border-ink bg-cream p-4">
                <div class="label mb-2">03. {m.step_glue_title()}</div>
                <p class="text-sm text-ink-soft">{m.step_glue_desc()}</p>
              </div>
              <div class="border-2 border-ink bg-cream p-4">
                <div class="label mb-2">04. {m.step_admire_title()}</div>
                <p class="text-sm text-ink-soft">{m.step_admire_desc()}</p>
              </div>
            </div>
          </div>

          <!-- CTA -->
          <div class="mt-12 text-center">
            <a href={localizeHref('/shop')} class="btn btn-primary btn-lg paper-press inline-block">
              {m.landing_view_all_kits()}
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>

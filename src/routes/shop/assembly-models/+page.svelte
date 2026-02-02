<script lang="ts">
  import { products } from '$lib/data/products';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import ProductCard from '$lib/components/ProductCard.svelte';
</script>

<!-- SEO handled by global SEOHead component in layout -->
<!-- BRUTALIST DESIGN - NO ROUNDED CORNERS -->
<main class="bg-cream">
  <!-- Hero Section -->
  <section class="bg-cream py-16">
    <div class="fc-container">
      <div class="paper-shadow-lg border-3 border-ink bg-paper p-8 md:p-12">
        <span class="tag tag-mint mb-4 inline-block">
          {m.landing_assembly_title()}
        </span>

        <h1 class="heading-1 mb-4">
          {m.landing_assembly_title()}
        </h1>

        <p class="body mb-6 max-w-2xl text-ink-soft">
          {m.landing_assembly_description()}
        </p>

        <!-- Stats/Features Grid -->
        <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="border-2 border-ink bg-cream p-4">
            <div class="mb-1 text-2xl font-bold text-ink">{m.landing_stat_glue()}</div>
            <div class="text-sm text-ink-muted">{m.landing_stat_glue_desc()}</div>
          </div>
          <div class="border-2 border-ink bg-cream p-4">
            <div class="mb-1 text-2xl font-bold text-ink">{m.landing_stat_cardboard()}</div>
            <div class="text-sm text-ink-muted">{m.landing_stat_cardboard_desc()}</div>
          </div>
          <div class="border-2 border-ink bg-cream p-4">
            <div class="mb-1 text-2xl font-bold text-ink">{m.landing_stat_geometry()}</div>
            <div class="text-sm text-ink-muted">Polygon art</div>
          </div>
          <div class="border-2 border-ink bg-cream p-4">
            <div class="mb-1 text-2xl font-bold text-ink">{m.landing_stat_diy()}</div>
            <div class="text-sm text-ink-muted">{m.landing_stat_diy_desc()}</div>
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
        {#each products as product (product.id)}
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
          {m.landing_assembly_content_title()}
        </h2>

        <div class="body space-y-6">
          <ul class="ml-6 space-y-4">
            <li class="flex items-start gap-3">
              <span class="text-xl font-bold text-mint">→</span>
              <div>
                <span class="font-bold text-ink">{m.step_punch_title()}</span>
                <span class="text-ink-soft"> - {m.landing_assembly_feature1()}</span>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-xl font-bold text-coral">→</span>
              <div>
                <span class="font-bold text-ink">{m.landing_whats_in_kit()}</span>
                <span class="text-ink-soft"> - {m.landing_assembly_feature2()}</span>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-xl font-bold text-gold">→</span>
              <div>
                <span class="font-bold text-ink">{m.landing_whats_in_kit_guide()}</span>
                <span class="text-ink-soft"> - {m.landing_assembly_feature3()}</span>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-xl font-bold text-violet">→</span>
              <div>
                <span class="font-bold text-ink">{m.landing_stat_cardboard()}</span>
                <span class="text-ink-soft"> - {m.landing_assembly_feature4()}</span>
              </div>
            </li>
          </ul>

          <!-- What You Get Section -->
          <div class="mt-8 border-t-3 border-ink pt-8">
            <h3 class="heading-2 mb-6 text-xl">
              {m.landing_whats_in_kit()}
            </h3>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div class="border-2 border-ink bg-cream p-4">
                <div class="label mb-2">{m.landing_whats_in_kit_cardboard()}</div>
                <p class="text-sm text-ink-soft">{m.landing_whats_in_kit_cardboard_desc()}</p>
              </div>
              <div class="border-2 border-ink bg-cream p-4">
                <div class="label mb-2">{m.landing_whats_in_kit_guide()}</div>
                <p class="text-sm text-ink-soft">{m.landing_whats_in_kit_guide_desc()}</p>
              </div>
              <div class="border-2 border-ink bg-cream p-4">
                <div class="label mb-2">{m.landing_whats_in_kit_everything()}</div>
                <p class="text-sm text-ink-soft">{m.landing_whats_in_kit_everything_desc()}</p>
              </div>
            </div>
          </div>

          <!-- Process Steps -->
          <div class="mt-8 border-t-3 border-ink pt-8">
            <h3 class="heading-2 mb-6 text-xl">
              {m.landing_how_to_assemble()}
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

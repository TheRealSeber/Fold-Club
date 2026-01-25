<script lang="ts">
  import { localizeHref } from '$lib/paraglide/runtime';
  import { m } from '$lib/paraglide/messages';

  type Props = {
    onOpenHowItWorks?: () => void;
  };

  let { onOpenHowItWorks }: Props = $props();

  const handleOpen = () => {
    onOpenHowItWorks?.();
  };
</script>

<section class="relative overflow-hidden bg-cream">
  <div class="clip-diagonal-br absolute top-0 right-0 hidden h-1/2 w-1/3 bg-coral lg:block"></div>

  <div class="relative z-10 fc-container py-20 lg:py-32">
    <div class="max-w-3xl">
      <span class="tag tag-coral mb-6">{m.hero_tag()}</span>

      <h1 class="heading-display hero-title mb-6">
        {m.hero_title_line1()}<br />
        <span class="text-coral">{m.hero_title_line2()}</span>
      </h1>

      <p class="body-large mb-10 max-w-xl text-ink-soft">
        {m.hero_description()}
      </p>

      <div class="flex flex-wrap gap-4">
        <a
          href={localizeHref('/shop')}
          class="btn btn-primary btn-lg paper-press"
          aria-label={m.hero_shop_aria()}
        >
          {m.hero_shop_cta()}
        </a>
        <button
          onclick={handleOpen}
          class="btn btn-secondary btn-lg paper-press"
          aria-label={m.hero_how_aria()}
        >
          {m.hero_how_cta()}
        </button>
      </div>
    </div>
  </div>
</section>

<style>
  .hero-title {
    font-size: clamp(2.5rem, 12vw, 6rem);
    line-height: 1;
    overflow-wrap: anywhere;
  }
</style>

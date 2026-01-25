<script lang="ts">
  import { localizeHref } from '$lib/paraglide/runtime';
  import { m } from '$lib/paraglide/messages';
</script>

<section class="bg-coral py-20">
  <div class="fc-container text-center">
    <h2 class="heading-1 mb-6 text-paper">{m.cta_title()}</h2>
    <p class="body-large mx-auto mb-10 max-w-2xl text-paper/90">
      {m.cta_desc()}
    </p>
    <div class="flex flex-wrap justify-center gap-4">
      <a
        href={localizeHref('/shop')}
        class="btn btn-primary btn-lg paper-press border-ink bg-ink text-cream"
      >
        {m.cta_start_building()}
      </a>
      <a
        href={localizeHref('/gallery')}
        class="btn btn-lg paper-press border-ink bg-paper text-ink"
      >
        {m.cta_see_gallery()}
      </a>
    </div>
  </div>
</section>

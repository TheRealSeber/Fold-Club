<script lang="ts">
  import { m } from '$lib/paraglide/messages';
</script>

<div class="max-w-3xl space-y-12">
  <p class="body-large">{m.terms_intro()}</p>

  <section>
    <h2 class="heading-2 mb-4">{m.terms_use_title()}</h2>
    <p class="body text-ink-muted">{m.terms_use_desc()}</p>
  </section>

  <section>
    <h2 class="heading-2 mb-4">{m.terms_orders_title()}</h2>
    <p class="body text-ink-muted">{m.terms_orders_desc()}</p>
  </section>

  <section>
    <h2 class="heading-2 mb-4">{m.terms_ip_title()}</h2>
    <p class="body text-ink-muted">{m.terms_ip_desc()}</p>
  </section>

  <section>
    <h2 class="heading-2 mb-4">{m.terms_liability_title()}</h2>
    <p class="body text-ink-muted">{m.terms_liability_desc()}</p>
  </section>

  <section>
    <h2 class="heading-2 mb-4">{m.terms_changes_title()}</h2>
    <p class="body text-ink-muted">{m.terms_changes_desc()}</p>
  </section>
</div>

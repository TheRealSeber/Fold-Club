<script lang="ts">
  import { m } from '$lib/paraglide/messages';
</script>

<div class="max-w-3xl space-y-12">
  <p class="body-large">{m.privacy_intro()}</p>

  <section>
    <h2 class="heading-2 mb-4">{m.privacy_collect_title()}</h2>
    <p class="body text-ink-muted">{m.privacy_collect_desc()}</p>
  </section>

  <section>
    <h2 class="heading-2 mb-4">{m.privacy_use_title()}</h2>
    <p class="body text-ink-muted">{m.privacy_use_desc()}</p>
  </section>

  <section>
    <h2 class="heading-2 mb-4">{m.privacy_protect_title()}</h2>
    <p class="body text-ink-muted">{m.privacy_protect_desc()}</p>
  </section>

  <section>
    <h2 class="heading-2 mb-4">{m.privacy_contact_title()}</h2>
    <p class="body text-ink-muted">{m.privacy_contact_desc()}</p>
  </section>
</div>

<script lang="ts">
  import { m } from '$lib/paraglide/messages';

  let name = $state('');
  let email = $state('');
  let message = $state('');

  function handleSubmit(e: Event) {
    e.preventDefault();
    // Form is non-functional for now - just prevents default
  }
</script>

<div class="max-w-3xl">
  <div class="grid grid-cols-1 gap-12 md:grid-cols-2">
    <div>
      <form onsubmit={handleSubmit} class="space-y-6">
        <div>
          <label for="name" class="label mb-2 block">{m.contact_form_name()}</label>
          <input type="text" id="name" bind:value={name} class="input" required />
        </div>
        <div>
          <label for="email" class="label mb-2 block">{m.contact_form_email()}</label>
          <input type="email" id="email" bind:value={email} class="input" required />
        </div>
        <div>
          <label for="message" class="label mb-2 block">{m.contact_form_message()}</label>
          <textarea id="message" bind:value={message} rows="5" class="input resize-none" required
          ></textarea>
        </div>
        <button type="submit" class="btn btn-primary paper-press">
          {m.contact_form_submit()}
        </button>
      </form>
    </div>

    <div class="space-y-8">
      <div>
        <h3 class="label mb-4 text-coral">{m.contact_email_label()}</h3>
        <a href="mailto:{m.contact_email()}" class="heading text-xl hover:text-coral">
          {m.contact_email()}
        </a>
      </div>

      <div>
        <h3 class="label mb-4 text-coral">{m.contact_social_label()}</h3>
        <div class="flex gap-4">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-secondary btn-sm paper-press-sm"
            aria-label={m.footer_social_instagram_aria()}
          >
            IG
          </a>
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-secondary btn-sm paper-press-sm"
            aria-label={m.footer_social_tiktok_aria()}
          >
            TT
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-secondary btn-sm paper-press-sm"
            aria-label={m.footer_social_youtube_aria()}
          >
            YT
          </a>
        </div>
      </div>
    </div>
  </div>
</div>

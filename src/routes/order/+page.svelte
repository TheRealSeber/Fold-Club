<script lang="ts">
  import { localizeHref } from '$lib/paraglide/runtime';
  import { m } from '$lib/paraglide/messages';

  let email = $state('');
  let submitted = $state(false);

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (email) {
      submitted = true;
      // In a real app, this would save the email to a waitlist
    }
  }
</script>

<div class="mx-auto max-w-xl">
  <div class="brutal-card paper-shadow-lg p-12 text-center">
    <div class="heading mb-6 text-8xl text-coral">!</div>
    <h2 class="heading-2 mb-4">{m.order_coming_soon()}</h2>
    <p class="body mb-8 text-ink-muted">{m.order_coming_soon_desc()}</p>

    {#if !submitted}
      <form onsubmit={handleSubmit} class="space-y-4">
        <input
          type="email"
          bind:value={email}
          placeholder={m.order_email_placeholder()}
          required
          class="brutal-input w-full"
        />
        <button type="submit" class="btn btn-primary paper-press w-full">
          {m.order_notify_btn()}
        </button>
      </form>
    {:else}
      <div class="brutal-card bg-mint/20 p-6">
        <p class="heading text-mint">{m.order_success()}</p>
        <p class="body-small mt-2 text-ink-muted">{m.order_success_desc()}</p>
      </div>
    {/if}

    <div class="mt-8 border-t-2 border-ink/10 pt-8">
      <a href={localizeHref('/shop')} class="btn btn-secondary paper-press-sm">
        {m.order_back_to_shop()}
      </a>
    </div>
  </div>
</div>

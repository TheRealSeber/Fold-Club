<script lang="ts">
  import { consent } from '$lib/tracking/consent.svelte';
  import { m } from '$lib/paraglide/messages';

  let showCustomize = $state(false);
  let localAnalytics = $state(false);
  let localMarketing = $state(false);

  function handleAcceptAll() {
    consent.grantAll();
  }

  function handleRejectAll() {
    consent.rejectAll();
  }

  function handleCustomize() {
    showCustomize = !showCustomize;
  }

  function handleSave() {
    consent.update({
      analytics: localAnalytics,
      marketing: localMarketing,
    });
  }
</script>

{#if consent.bannerVisible}
  <div class="fixed bottom-0 left-0 right-0 z-50 bg-cream border-t-3 border-ink paper-shadow-lg">
    <div class="fc-container py-6">
      {#if !showCustomize}
        <!-- Simple banner -->
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p class="body max-w-2xl text-ink">
            {m.consent_banner_text()}
          </p>
          <div class="flex flex-wrap gap-3">
            <button onclick={handleAcceptAll} class="btn btn-primary paper-press">
              {m.consent_accept_all()}
            </button>
            <button onclick={handleRejectAll} class="btn btn-secondary paper-press">
              {m.consent_reject_all()}
            </button>
            <button onclick={handleCustomize} class="btn btn-secondary paper-press">
              {m.consent_customize()}
            </button>
          </div>
        </div>
      {:else}
        <!-- Customization panel -->
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="heading-2 text-ink">
              {m.consent_preferences_title()}
            </h2>
            <button onclick={handleCustomize} class="text-ink-soft hover:text-ink body">
              ✕
            </button>
          </div>

          <div class="space-y-4">
            <!-- Necessary cookies (always on) -->
            <div class="brutal-card p-4 bg-cream-warm">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="label text-ink mb-1">{m.consent_necessary_label()}</h3>
                  <p class="body-small text-ink-soft">{m.consent_necessary_desc()}</p>
                </div>
                <div class="label text-ink-muted">
                  {m.consent_necessary_always()}
                </div>
              </div>
            </div>

            <!-- Analytics cookies -->
            <div class="brutal-card p-4 bg-paper">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="label text-ink mb-1">{m.consent_analytics_label()}</h3>
                  <p class="body-small text-ink-soft">{m.consent_analytics_desc()}</p>
                </div>
                <label class="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    bind:checked={localAnalytics}
                    class="sr-only peer"
                  />
                  <div class="w-full h-full bg-cream border-3 border-ink peer-checked:bg-mint"></div>
                  <div class="absolute top-0 left-0 w-6 h-6 bg-ink peer-checked:left-6"></div>
                </label>
              </div>
            </div>

            <!-- Marketing cookies -->
            <div class="brutal-card p-4 bg-paper">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="label text-ink mb-1">{m.consent_marketing_label()}</h3>
                  <p class="body-small text-ink-soft">{m.consent_marketing_desc()}</p>
                </div>
                <label class="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    bind:checked={localMarketing}
                    class="sr-only peer"
                  />
                  <div class="w-full h-full bg-cream border-3 border-ink peer-checked:bg-mint"></div>
                  <div class="absolute top-0 left-0 w-6 h-6 bg-ink peer-checked:left-6"></div>
                </label>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button onclick={handleSave} class="btn btn-primary paper-press">
              {m.consent_save()}
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

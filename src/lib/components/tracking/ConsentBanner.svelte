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
    if (!showCustomize) {
      localAnalytics = consent.analytics;
      localMarketing = consent.marketing;
    }
    showCustomize = !showCustomize;
  }

  function handleSave() {
    consent.update({
      analytics: localAnalytics,
      marketing: localMarketing
    });
  }
</script>

{#if consent.bannerVisible}
  <!-- Full-page backdrop overlay — blocks all interaction -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4">
    <!-- Modal card -->
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-heading"
      class="brutal-card paper-shadow-lg w-full max-w-lg border-3 border-ink bg-cream p-6 md:p-8"
    >
      {#if !showCustomize}
        <div class="space-y-6">
          <h2 id="consent-heading" class="heading-2 text-ink">{m.consent_preferences_title()}</h2>
          <p class="body text-ink">
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
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="heading-2 text-ink">{m.consent_preferences_title()}</h2>
            <button onclick={handleCustomize} class="body text-ink-soft hover:text-ink" aria-label={m.consent_close_customize()}> ✕ </button>
          </div>

          <div class="space-y-4">
            <!-- Necessary cookies (always on) -->
            <div class="brutal-card bg-cream-warm p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="label mb-1 text-ink">{m.consent_necessary_label()}</h3>
                  <p class="body-small text-ink-soft">{m.consent_necessary_desc()}</p>
                </div>
                <div class="label text-ink-muted">{m.consent_necessary_always()}</div>
              </div>
            </div>

            <!-- Analytics cookies -->
            <div class="brutal-card bg-paper p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="label mb-1 text-ink">{m.consent_analytics_label()}</h3>
                  <p class="body-small text-ink-soft">{m.consent_analytics_desc()}</p>
                </div>
                <label class="relative inline-block h-6 w-12">
                  <input type="checkbox" bind:checked={localAnalytics} class="peer sr-only" />
                  <div
                    class="h-full w-full border-3 border-ink bg-cream peer-checked:bg-mint"
                  ></div>
                  <div class="absolute top-0 left-0 h-6 w-6 bg-ink peer-checked:left-6"></div>
                </label>
              </div>
            </div>

            <!-- Marketing cookies -->
            <div class="brutal-card bg-paper p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="label mb-1 text-ink">{m.consent_marketing_label()}</h3>
                  <p class="body-small text-ink-soft">{m.consent_marketing_desc()}</p>
                </div>
                <label class="relative inline-block h-6 w-12">
                  <input type="checkbox" bind:checked={localMarketing} class="peer sr-only" />
                  <div
                    class="h-full w-full border-3 border-ink bg-cream peer-checked:bg-mint"
                  ></div>
                  <div class="absolute top-0 left-0 h-6 w-6 bg-ink peer-checked:left-6"></div>
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

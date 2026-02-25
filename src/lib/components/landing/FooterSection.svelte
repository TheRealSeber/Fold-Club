<script lang="ts">
  import { localizeHref } from '$lib/paraglide/runtime';
  import { m } from '$lib/paraglide/messages';
  import { consent } from '$lib/tracking';

  const year = new Date().getFullYear();
</script>

<footer class="border-t-3 border-cream bg-ink text-cream">
  <div class="fc-container py-16">
    <div class="grid grid-cols-1 gap-12 md:grid-cols-4">
      <div class="md:col-span-2">
        <div class="heading mb-4 text-3xl">
          FOLD<span class="text-coral">.</span>CLUB
        </div>
        <p class="body mb-6 max-w-md text-cream/70">
          {m.footer_desc()}
        </p>
        <div class="flex gap-4">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-secondary btn-sm border-cream text-cream hover:bg-cream hover:text-ink"
            aria-label={m.footer_social_instagram_aria()}
          >
            IG
          </a>
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-secondary btn-sm border-cream text-cream hover:bg-cream hover:text-ink"
            aria-label={m.footer_social_tiktok_aria()}
          >
            TT
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-secondary btn-sm border-cream text-cream hover:bg-cream hover:text-ink"
            aria-label={m.footer_social_youtube_aria()}
          >
            YT
          </a>
        </div>
      </div>

      <div>
        <div class="label mb-4 text-coral">{m.footer_shop_label()}</div>
        <ul class="space-y-2">
          <li>
            <a href={localizeHref('/shop')} class="body-small text-cream/70 hover:text-cream"
              >{m.footer_all_kits()}</a
            >
          </li>
          <li>
            <a
              href={localizeHref('/shop?category=couples')}
              class="body-small text-cream/70 hover:text-cream">{m.footer_for_couples()}</a
            >
          </li>
          <li>
            <a
              href={localizeHref('/shop?category=kids')}
              class="body-small text-cream/70 hover:text-cream">{m.footer_for_kids()}</a
            >
          </li>
          <li>
            <a
              href={localizeHref('/shop?category=statement')}
              class="body-small text-cream/70 hover:text-cream">{m.footer_statement_pieces()}</a
            >
          </li>
        </ul>
      </div>

      <div>
        <div class="label mb-4 text-coral">{m.footer_help_label()}</div>
        <ul class="space-y-2">
          <li>
            <a href={localizeHref('/faq')} class="body-small text-cream/70 hover:text-cream"
              >{m.footer_faq()}</a
            >
          </li>
          <li>
            <a href={localizeHref('/shipping')} class="body-small text-cream/70 hover:text-cream"
              >{m.footer_shipping()}</a
            >
          </li>
          <li>
            <a href={localizeHref('/contact')} class="body-small text-cream/70 hover:text-cream"
              >{m.footer_contact()}</a
            >
          </li>
          <li>
            <a href={localizeHref('/returns')} class="body-small text-cream/70 hover:text-cream"
              >{m.footer_returns()}</a
            >
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div class="border-t-3 border-cream/20">
    <div class="fc-container flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
      <p class="body-small text-cream/50">
        {m.footer_rights({ year })}
      </p>
      <div class="flex gap-6">
        <a href={localizeHref('/privacy')} class="label text-cream/50 hover:text-cream"
          >{m.footer_privacy()}</a
        >
        <a href={localizeHref('/terms')} class="label text-cream/50 hover:text-cream"
          >{m.footer_terms()}</a
        >
        <button onclick={() => consent.showBanner()} class="label text-cream/50 hover:text-cream">
          {m.footer_cookie_settings()}
        </button>
      </div>
    </div>
  </div>
</footer>

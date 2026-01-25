<script lang="ts">
  import { getLocale, localizeHref, setLocale } from '$lib/paraglide/runtime';
  import { m } from '$lib/paraglide/messages';

  type Props = {
    cartCount?: number;
  };

  let { cartCount = 0 }: Props = $props();

  const locale = getLocale();
</script>

<header class="sticky top-0 z-50 border-b-3 border-ink bg-paper">
  <nav
    class="fc-container flex items-center justify-between py-4"
    aria-label={m.nav_primary_aria()}
  >
    <a href={localizeHref('/')} class="heading text-2xl tracking-tight">
      <span class="hidden sm:inline">FOLD<span class="text-coral">.</span>CLUB</span>
      <span class="inline sm:hidden">F<span class="text-coral">.</span>C</span>
    </a>

    <div class="hidden items-center gap-8 md:flex">
      <a href={localizeHref('/shop')} class="label hover:text-coral">
        {m.nav_shop()}
      </a>
      <a href={localizeHref('/gallery')} class="label hover:text-coral">
        {m.nav_gallery()}
      </a>
    </div>

    <div class="flex items-center gap-2">
      <div class="flex items-center gap-2" aria-label={m.nav_lang_switcher_aria()}>
        <button
          onclick={() => setLocale('pl')}
          class={`btn btn-sm paper-press-sm ${locale === 'pl' ? 'btn-primary' : 'btn-secondary'}`}
          aria-label={m.nav_lang_pl_aria()}
        >
          {m.nav_lang_pl_label()}
        </button>
        <button
          onclick={() => setLocale('en')}
          class={`btn btn-sm paper-press-sm ${locale === 'en' ? 'btn-primary' : 'btn-secondary'}`}
          aria-label={m.nav_lang_en_aria()}
        >
          {m.nav_lang_en_label()}
        </button>
      </div>

      <a
        href={localizeHref('/cart')}
        class={`btn btn-sm paper-press-sm ${cartCount > 0 ? 'btn-coral' : 'btn-secondary'}`}
        aria-label={m.nav_cart_aria()}
      >
        {m.nav_cart({ count: cartCount })}
      </a>
    </div>
  </nav>
</header>

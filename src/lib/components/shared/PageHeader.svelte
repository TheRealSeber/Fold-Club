<script lang="ts">
  type Props = {
    title: string;
    subtitle?: string;
  };

  let { title, subtitle }: Props = $props();
</script>

<div class="border-b-3 border-ink bg-cream-warm py-16">
  <div class="fc-container">
    <h1 class="heading-1">{title}</h1>
    {#if subtitle}
      <p class="body-large mt-4 max-w-2xl text-ink-muted">{subtitle}</p>
    {/if}
  </div>
</div>

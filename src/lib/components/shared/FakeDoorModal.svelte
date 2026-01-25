<script lang="ts">
  import { m } from '$lib/paraglide/messages';

  interface Props {
    open: boolean;
    onClose?: () => void;
  }

  let { open = $bindable(), onClose }: Props = $props();

  function handleClose() {
    open = false;
    onClose?.();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') handleClose();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) handleClose();
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-ink/80"
    role="dialog"
    aria-modal="true"
    aria-labelledby="fake-door-title"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    tabindex="-1"
  >
    <div class="brutal-card paper-shadow-xl mx-4 max-w-md bg-paper p-8">
      <div class="heading mb-4 text-center text-6xl text-coral">!</div>

      <h2 id="fake-door-title" class="heading-2 mb-4 text-center">
        {m.fake_door_title()}
      </h2>

      <p class="body mb-6 text-center text-ink-muted">
        {m.fake_door_description()}
      </p>

      <button class="btn btn-primary paper-press w-full" onclick={handleClose}>
        {m.fake_door_close()}
      </button>
    </div>
  </div>
{/if}

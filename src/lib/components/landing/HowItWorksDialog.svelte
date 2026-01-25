<script lang="ts">
  import { Dialog } from 'bits-ui';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { m } from '$lib/paraglide/messages';

  type Step = {
    num: string;
    title: () => string;
    desc: () => string;
  };

  type Props = {
    open: boolean;
    steps: Step[];
  };

  let { open = $bindable(false), steps }: Props = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 z-40 bg-ink/80" />
    <Dialog.Content
      class="brutal-card paper-shadow-xl fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-paper"
    >
      <div class="p-8">
        <div class="mb-8 flex items-start justify-between">
          <div>
            <Dialog.Title class="heading-2">{m.dialog_title()}</Dialog.Title>
            <Dialog.Description class="body mt-2 text-ink-muted">
              {m.dialog_desc()}
            </Dialog.Description>
          </div>
          <Dialog.Close class="btn btn-secondary btn-sm" aria-label={m.dialog_close_aria()}>
            &times;
          </Dialog.Close>
        </div>

        <div class="space-y-6">
          {#each steps as step, i (step.num)}
            <div
              class={`flex items-start gap-6 border-3 border-ink p-4 ${i % 2 === 0 ? 'bg-cream' : 'bg-cream-warm'}`}
            >
              <div class="heading w-16 shrink-0 text-4xl text-coral">{step.num}</div>
              <div>
                <h3 class="heading mb-1 text-xl">{step.title()}</h3>
                <p class="body text-ink-muted">{step.desc()}</p>
              </div>
            </div>
          {/each}
        </div>

        <div class="mt-8 border-t-3 border-ink pt-6">
          <div class="flex flex-col gap-4 sm:flex-row">
            <a
              href={localizeHref('/shop')}
              class="btn btn-primary btn-lg paper-press flex-1 text-center"
            >
              {m.dialog_start_shopping()}
            </a>
            <Dialog.Close class="btn btn-secondary btn-lg paper-press flex-1">
              {m.dialog_close()}
            </Dialog.Close>
          </div>
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<style>
  :global(.bits-dialog-overlay) {
    z-index: 40;
  }

  :global(.bits-dialog-content) {
    z-index: 50;
  }
</style>

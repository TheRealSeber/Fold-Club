<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	type Step = {
		num: string;
		title: () => string;
		desc: () => string;
	};

	type Props = {
		steps: Step[];
	};

	let { steps }: Props = $props();
</script>

<section class="bg-ink py-20 text-cream">
	<div class="fc-container">
		<div class="mb-16 text-center">
			<span class="label mb-2 block text-coral">{m.simple_process_label()}</span>
			<h2 class="heading-2">{m.simple_process_title()}</h2>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
			{#each steps as step, i (step.num)}
				<div class="relative border-3 border-cream p-6">
					<div class="heading mb-4 text-6xl text-coral">{step.num}</div>
					<h3 class="heading mb-2 text-xl">{step.title()}</h3>
					<p class="body-small text-cream/70">{step.desc()}</p>

					{#if i < steps.length - 1}
						<div
							class="absolute top-1/2 -right-7 z-10 hidden -translate-y-1/2 text-3xl font-bold text-coral lg:block"
						>
							&rarr;
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>

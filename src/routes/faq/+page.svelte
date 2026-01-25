<script lang="ts">
	import { onMount } from 'svelte';
	import InfoPageLayout from '$lib/components/shared/InfoPageLayout.svelte';
	import { m } from '$lib/paraglide/messages';
	import { analytics } from '$lib/stores/analytics';
	import { Accordion } from 'bits-ui';

	const faqs = [
		{ id: 1, q: () => m.faq_q1(), a: () => m.faq_a1() },
		{ id: 2, q: () => m.faq_q2(), a: () => m.faq_a2() },
		{ id: 3, q: () => m.faq_q3(), a: () => m.faq_a3() },
		{ id: 4, q: () => m.faq_q4(), a: () => m.faq_a4() },
		{ id: 5, q: () => m.faq_q5(), a: () => m.faq_a5() },
		{ id: 6, q: () => m.faq_q6(), a: () => m.faq_a6() }
	];

	onMount(() => {
		analytics.trackPageView('faq');
	});
</script>

<InfoPageLayout title={m.faq_title()} subtitle={m.faq_subtitle()}>
	<div class="max-w-3xl">
		<Accordion.Root type="single" class="space-y-4">
			{#each faqs as faq (faq.id)}
				<Accordion.Item value="item-{faq.id}" class="brutal-card paper-shadow-sm">
					<Accordion.Trigger
						class="group flex w-full items-center justify-between gap-4 p-6 text-left"
					>
						<span class="heading text-lg">{faq.q()}</span>
						<span class="text-2xl text-coral group-data-[state=open]:rotate-45">+</span>
					</Accordion.Trigger>
					<Accordion.Content class="px-6 pb-6">
						<p class="body text-ink-muted">{faq.a()}</p>
					</Accordion.Content>
				</Accordion.Item>
			{/each}
		</Accordion.Root>
	</div>
</InfoPageLayout>

<script lang="ts">
	import { onMount } from 'svelte';
	import InfoPageLayout from '$lib/components/shared/InfoPageLayout.svelte';
	import { m } from '$lib/paraglide/messages';
	import { analytics } from '$lib/stores/analytics';

	const zones = [
		{
			name: () => m.shipping_poland(),
			time: () => m.shipping_poland_time(),
			cost: () => m.shipping_poland_cost()
		},
		{
			name: () => m.shipping_eu(),
			time: () => m.shipping_eu_time(),
			cost: () => m.shipping_eu_cost()
		},
		{
			name: () => m.shipping_international(),
			time: () => m.shipping_international_time(),
			cost: () => m.shipping_international_cost()
		}
	];

	onMount(() => {
		analytics.trackPageView('shipping');
	});
</script>

<InfoPageLayout title={m.shipping_title()} subtitle={m.shipping_subtitle()}>
	<div class="max-w-3xl space-y-12">
		<section>
			<h2 class="heading-2 mb-6">{m.shipping_zones_title()}</h2>
			<div class="space-y-4">
				{#each zones as zone}
					<div class="brutal-card paper-shadow-sm p-6">
						<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div>
								<h3 class="heading text-xl">{zone.name()}</h3>
								<p class="body-small mt-1 text-ink-muted">{zone.time()}</p>
							</div>
							<div class="tag tag-coral">{zone.cost()}</div>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<section>
			<h2 class="heading-2 mb-6">{m.shipping_tracking_title()}</h2>
			<div class="brutal-card paper-shadow-sm p-6">
				<p class="body text-ink-muted">{m.shipping_tracking_desc()}</p>
			</div>
		</section>
	</div>
</InfoPageLayout>

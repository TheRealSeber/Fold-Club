<script lang="ts">
	import { onMount } from 'svelte';
	import InfoPageLayout from '$lib/components/shared/InfoPageLayout.svelte';
	import { m } from '$lib/paraglide/messages';
	import { analytics } from '$lib/stores/analytics';

	const steps = [
		() => m.returns_step1(),
		() => m.returns_step2(),
		() => m.returns_step3(),
		() => m.returns_step4()
	];

	const conditions = [
		() => m.returns_condition1(),
		() => m.returns_condition2(),
		() => m.returns_condition3()
	];

	onMount(() => {
		analytics.trackPageView('returns');
	});
</script>

<InfoPageLayout title={m.returns_title()} subtitle={m.returns_subtitle()}>
	<div class="max-w-3xl space-y-12">
		<section>
			<h2 class="heading-2 mb-4">{m.returns_policy_title()}</h2>
			<p class="body text-ink-muted">{m.returns_policy_desc()}</p>
		</section>

		<section>
			<h2 class="heading-2 mb-6">{m.returns_steps_title()}</h2>
			<div class="space-y-4">
				{#each steps as step, i}
					<div class="brutal-card paper-shadow-sm flex items-start gap-4 p-6">
						<span class="heading text-2xl text-coral">{i + 1}</span>
						<p class="body pt-1">{step()}</p>
					</div>
				{/each}
			</div>
		</section>

		<section>
			<h2 class="heading-2 mb-4">{m.returns_refund_title()}</h2>
			<p class="body text-ink-muted">{m.returns_refund_desc()}</p>
		</section>

		<section>
			<h2 class="heading-2 mb-6">{m.returns_conditions_title()}</h2>
			<ul class="space-y-3">
				{#each conditions as condition}
					<li class="flex items-start gap-3">
						<span class="mt-1 text-coral">*</span>
						<span class="body">{condition()}</span>
					</li>
				{/each}
			</ul>
		</section>
	</div>
</InfoPageLayout>

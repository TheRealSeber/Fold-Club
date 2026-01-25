<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	const stats = [
		{ value: '50K+', label: m.stats_creations_built() },
		{ value: '12', label: m.stats_unique_designs() },
		{ value: '98%', label: m.stats_success_rate() },
		{ value: '4.9', label: m.stats_avg_rating() }
	];
</script>

<div class="border-t-3 border-ink bg-paper">
	<div class="lg:fc-container">
		<div class="stats-grid grid grid-cols-2 border-ink md:grid-cols-4">
			{#each stats as stat (stat.value)}
				<div class="px-4 py-6 text-center">
					<div class="heading text-3xl">{stat.value}</div>
					<div class="label text-ink-muted">{stat.label}</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.stats-grid > * {
		border-left-width: 3px;
		border-left-style: solid;
	}

	.stats-grid > *:nth-child(1) {
		border-left-width: 0;
	}

	@media (max-width: 767px) {
		.stats-grid {
			position: relative;
			background-image:
				linear-gradient(
					to right,
					transparent calc(50% - 1.5px),
					var(--color-ink) calc(50% - 1.5px),
					var(--color-ink) calc(50% + 1.5px),
					transparent calc(50% + 1.5px)
				),
				linear-gradient(
					to bottom,
					transparent calc(50% - 1.5px),
					var(--color-ink) calc(50% - 1.5px),
					var(--color-ink) calc(50% + 1.5px),
					transparent calc(50% + 1.5px)
				);
			background-repeat: no-repeat;
			background-size: 100% 100%;
		}

		.stats-grid > * {
			border-left-width: 0;
			border-top-width: 0;
		}
	}
</style>

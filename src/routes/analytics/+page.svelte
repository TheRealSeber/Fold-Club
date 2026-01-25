<script lang="ts">
	import { onMount } from 'svelte';
	import LandingNav from '$lib/components/landing/LandingNav.svelte';
	import FooterSection from '$lib/components/landing/FooterSection.svelte';
	import PageHeader from '$lib/components/shared/PageHeader.svelte';
	import { m } from '$lib/paraglide/messages';
	import { cart } from '$lib/stores/cart.svelte.ts';
	import { analytics } from '$lib/stores/analytics';
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';

	let summary = $state(analytics.getSummary());

	function refresh() {
		summary = analytics.getSummary();
	}

	function clearData() {
		analytics.clearAnalytics();
		refresh();
	}

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleString();
	}

	onMount(() => {
		if (!dev) {
			goto('/');
		}
	});
</script>

{#if dev}
	<div class="flex min-h-screen flex-col">
		<LandingNav cartCount={cart.count} />
		<PageHeader title={m.analytics_title()} subtitle={m.analytics_subtitle()} />

		<main class="flex-grow bg-cream py-16">
			<div class="fc-container">
				<div class="mb-12 grid grid-cols-2 gap-6 md:grid-cols-4">
					<div class="brutal-card paper-shadow-sm p-6 text-center">
						<div class="heading mb-2 text-4xl text-coral">{summary.page_view}</div>
						<div class="label">{m.analytics_page_views()}</div>
					</div>
					<div class="brutal-card paper-shadow-sm p-6 text-center">
						<div class="heading mb-2 text-4xl text-mint">{summary.product_view}</div>
						<div class="label">{m.analytics_product_views()}</div>
					</div>
					<div class="brutal-card paper-shadow-sm p-6 text-center">
						<div class="heading mb-2 text-4xl text-gold">{summary.add_to_cart}</div>
						<div class="label">{m.analytics_add_to_cart()}</div>
					</div>
					<div class="brutal-card paper-shadow-sm p-6 text-center">
						<div class="heading mb-2 text-4xl text-violet">{summary.checkout_click}</div>
						<div class="label">{m.analytics_checkout_clicks()}</div>
					</div>
				</div>

				<div class="mb-8 flex gap-4">
					<button class="btn btn-secondary paper-press-sm" onclick={refresh}> REFRESH </button>
					<button class="btn btn-coral paper-press-sm" onclick={clearData}>
						{m.analytics_clear()}
					</button>
				</div>

				<h2 class="heading-2 mb-6">{m.analytics_events_title()}</h2>
				<div class="brutal-card paper-shadow-sm max-h-96 overflow-y-auto p-6">
					{#if summary.events.length === 0}
						<p class="body text-ink-muted">No events recorded yet.</p>
					{:else}
						<div class="space-y-3">
							{#each [...summary.events].reverse().slice(0, 50) as event}
								<div class="flex items-start gap-4 border-b border-ink/10 pb-3 last:border-0">
									<span
										class={`tag ${
											event.type === 'page_view'
												? 'tag-coral'
												: event.type === 'product_view'
													? 'tag-mint'
													: event.type === 'add_to_cart'
														? 'tag-gold'
														: 'tag-violet'
										}`}
									>
										{event.type}
									</span>
									<div class="flex-grow">
										<code class="body-small text-ink-muted">
											{JSON.stringify(event.data)}
										</code>
									</div>
									<span class="body-small whitespace-nowrap text-ink-muted">
										{formatDate(event.timestamp)}
									</span>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</main>

		<FooterSection />
	</div>
{/if}

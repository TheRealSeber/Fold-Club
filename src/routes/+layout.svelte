<script lang="ts">
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>FOLD CLUB | DIY Papercraft Masks</title>
	<meta
		name="description"
		content="Create stunning low-poly paper masks. DIY papercraft kits for Gen Z, kids, and couples looking for a cool creative date."
	/>
	<meta name="theme-color" content="#faf6f1" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
</svelte:head>

<div class="app">
	{@render children()}
</div>

<!-- Hidden language switcher for i18n -->
<div style="display:none">
	{#each locales as locale (locale)}
		<a href={localizeHref(page.url.pathname, { locale })}>
			{locale}
		</a>
	{/each}
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
</style>

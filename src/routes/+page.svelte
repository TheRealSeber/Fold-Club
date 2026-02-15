<script lang="ts">
  import { m } from '$lib/paraglide/messages';
  import HeroSection from '$lib/components/landing/HeroSection.svelte';
  import StatsBar from '$lib/components/landing/StatsBar.svelte';
  import ProductsSection from '$lib/components/landing/ProductsSection.svelte';
  import HowItWorksSection from '$lib/components/landing/HowItWorksSection.svelte';
  import CtaSection from '$lib/components/landing/CtaSection.svelte';
  import HowItWorksDialog from '$lib/components/landing/HowItWorksDialog.svelte';

  let { data } = $props();

  let dialogOpen = $state(false);

  const steps = [
    { num: '01', title: m.step_punch_title, desc: m.step_punch_desc },
    { num: '02', title: m.step_fold_title, desc: m.step_fold_desc },
    { num: '03', title: m.step_glue_title, desc: m.step_glue_desc },
    { num: '04', title: m.step_admire_title, desc: m.step_admire_desc }
  ];
</script>

<HeroSection onOpenHowItWorks={() => (dialogOpen = true)} />
<StatsBar />
<ProductsSection products={data.products} />
<HowItWorksSection {steps} />
<CtaSection />
<HowItWorksDialog bind:open={dialogOpen} {steps} />

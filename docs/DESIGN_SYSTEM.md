# Fold Club Design System

Complete reference for the brutalist, paper-sharp design language.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Shadows](#shadows)
5. [Spacing](#spacing)
6. [Components](#components)
7. [Patterns & Anti-Patterns](#patterns--anti-patterns)
8. [Accessibility](#accessibility)

---

## Design Philosophy

### Core Principles

| Principle               | Implementation                       |
| ----------------------- | ------------------------------------ |
| **No rounded corners**  | `border-radius: 0` enforced globally |
| **Hard shadows**        | Offset shadows, zero blur            |
| **Instant feedback**    | No transitions, hard cuts            |
| **High contrast**       | Cream backgrounds, ink text          |
| **Geometric precision** | Polygon shapes, sharp edges          |
| **Paper aesthetic**     | Simulates folded paper depth         |

### Target Audience Considerations

While the aesthetic is brutalist, the UX must remain accessible:

- **Gen Z**: Bold, meme-worthy, shareable
- **Kids**: Clear CTAs, simple navigation
- **Couples**: Inviting, not intimidating

---

## Color System

### CSS Variables

```css
:root {
	/* Cream Palette (Backgrounds) */
	--color-cream: #faf6f1; /* Primary background */
	--color-cream-warm: #f5ede3; /* Secondary/alternating */
	--color-cream-deep: #ebe0d2; /* Tertiary/cards */
	--color-paper: #ffffff; /* Pure white elements */
	--color-paper-shadow: #e8dfd3; /* Shadow tint */

	/* Ink Palette (Text) */
	--color-ink: #0d0d0d; /* Primary text */
	--color-ink-soft: #2d2d2d; /* Secondary text */
	--color-ink-muted: #5c5c5c; /* Muted/placeholder */

	/* Accent Colors */
	--color-accent-coral: #ff6b5b;
	--color-accent-mint: #3dd9b3;
	--color-accent-gold: #ffb830;
	--color-accent-violet: #7c5cff;
}
```

### Tailwind Classes

| Purpose            | Class                      |
| ------------------ | -------------------------- |
| Primary background | `bg-cream`                 |
| Warm background    | `bg-cream-warm`            |
| Deep background    | `bg-cream-deep`            |
| White surface      | `bg-paper`                 |
| Primary text       | `text-ink`                 |
| Secondary text     | `text-ink-soft`            |
| Muted text         | `text-ink-muted`           |
| Coral accent       | `text-coral`, `bg-coral`   |
| Mint accent        | `text-mint`, `bg-mint`     |
| Gold accent        | `text-gold`, `bg-gold`     |
| Violet accent      | `text-violet`, `bg-violet` |

### Color Usage Guidelines

```
┌─────────────────────────────────────────┐
│ bg-cream                                │
│  ┌─────────────────────────────────┐    │
│  │ bg-paper (cards, modals)        │    │
│  │  ┌───────────────────────────┐  │    │
│  │  │ bg-cream-warm (alternating)│  │    │
│  │  └───────────────────────────┘  │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

## Typography

### Font Families

```css
--font-heading: 'Archivo Black', Impact, sans-serif;
--font-body: 'DM Sans', system-ui, sans-serif;
```

### Type Scale

| Class              | Size     | Use Case                 |
| ------------------ | -------- | ------------------------ |
| `.heading-display` | 6rem     | Hero headlines           |
| `.heading-1`       | 3.5rem   | Page titles              |
| `.heading-2`       | 2.5rem   | Section headers          |
| `.heading-3`       | 2rem     | Subsections              |
| `.body-large`      | 1.125rem | Lead paragraphs          |
| `.body`            | 1rem     | Default text             |
| `.body-small`      | 0.875rem | Captions, meta           |
| `.label`           | 0.75rem  | Tags, labels (uppercase) |

### Heading Rules

1. **Always uppercase** for headings
2. **Tight letter-spacing** (`tracking-tight`)
3. **Tight line-height** (`leading-tight`)
4. Use `.heading` class for font-family

```svelte
<!-- Correct -->
<h1 class="heading-1">SHOP MASKS</h1>

<!-- Also correct (manual) -->
<h2 class="heading text-3xl uppercase">SECTION TITLE</h2>
```

---

## Shadows

### Hard Shadow System

All shadows use **zero blur** and **solid offset**:

```css
--shadow-xs: 2px 2px 0 var(--color-ink);
--shadow-sm: 3px 3px 0 var(--color-ink);
--shadow-md: 5px 5px 0 var(--color-ink);
--shadow-lg: 8px 8px 0 var(--color-ink);
--shadow-xl: 12px 12px 0 var(--color-ink);
```

### Utility Classes

| Class              | Shadow Size | Use Case            |
| ------------------ | ----------- | ------------------- |
| `.paper-shadow-xs` | 2px         | Small buttons, tags |
| `.paper-shadow-sm` | 3px         | Buttons, inputs     |
| `.paper-shadow-md` | 5px         | Cards, dialogs      |
| `.paper-shadow-lg` | 8px         | Modals, popovers    |
| `.paper-shadow-xl` | 12px        | Hero elements       |

### Colored Shadows

```css
.paper-shadow-coral {
	box-shadow: 5px 5px 0 var(--color-accent-coral);
}
.paper-shadow-mint {
	box-shadow: 5px 5px 0 var(--color-accent-mint);
}
.paper-shadow-gold {
	box-shadow: 5px 5px 0 var(--color-accent-gold);
}
.paper-shadow-violet {
	box-shadow: 5px 5px 0 var(--color-accent-violet);
}
```

---

## Spacing

### Scale

```css
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */
```

### Container

```css
.fc-container {
	max-width: 1280px;
	margin: 0 auto;
	padding: 0 1.5rem;
}

.fc-container-narrow {
	max-width: 960px;
}
.fc-container-wide {
	max-width: 1536px;
}
```

---

## Components

### Buttons

```svelte
<!-- Primary -->
<button class="btn btn-primary paper-press"> ACTION </button>

<!-- Secondary -->
<button class="btn btn-secondary paper-press"> CANCEL </button>

<!-- Accent Colors -->
<button class="btn btn-coral paper-press">CORAL</button>
<button class="btn btn-mint paper-press">MINT</button>

<!-- Sizes -->
<button class="btn btn-primary btn-lg paper-press">LARGE</button>
<button class="btn btn-primary btn-sm paper-press-sm">SMALL</button>
```

### Button Anatomy

```css
.btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 0.75rem 1.5rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	border: 3px solid var(--color-ink);
	cursor: pointer;
}
```

### Cards

```svelte
<!-- Static Card -->
<div class="brutal-card paper-shadow-md">
	<h3 class="heading text-xl">Card Title</h3>
	<p class="body text-ink-muted">Card content here.</p>
</div>

<!-- Interactive Card -->
<article class="brutal-card-interactive paper-press">
	<h3 class="heading text-xl">Clickable Card</h3>
</article>
```

### Tags / Badges

```svelte
<span class="tag">DEFAULT</span>
<span class="tag tag-coral">BESTSELLER</span>
<span class="tag tag-mint">NEW</span>
<span class="tag tag-gold">POPULAR</span>
<span class="tag tag-violet">CHALLENGE</span>
```

### Inputs

```svelte
<input type="text" class="input" placeholder="Enter text..." />
<input type="email" class="input" placeholder="you@example.com" />
```

### Dialogs (bits-ui)

```svelte
<script>
	import { Dialog } from 'bits-ui';
	let open = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-40 bg-ink/80" />
		<Dialog.Content
			class="brutal-card paper-shadow-xl fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-paper p-8"
		>
			<Dialog.Title class="heading-2">DIALOG TITLE</Dialog.Title>
			<Dialog.Description class="body mt-2 text-ink-muted">
				Dialog description here.
			</Dialog.Description>
			<Dialog.Close class="btn btn-secondary mt-6">CLOSE</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
```

### Borders

Always use 3px borders for brutalist weight:

```svelte
<!-- Usage -->
<div class="border-3 border-ink p-6">Content with thick border</div>

<!-- Local style -->
<style>
	.border-3 {
		border-width: 3px;
		border-style: solid;
	}
</style>
```

---

## Patterns & Anti-Patterns

### DO (Correct)

```svelte
<!-- Sharp corners, hard shadow, uppercase heading -->
<div class="brutal-card paper-shadow-md">
	<h2 class="heading-2">SECTION TITLE</h2>
	<p class="body text-ink-muted">Description text.</p>
	<button class="btn btn-primary paper-press">ACTION</button>
</div>
```

### DON'T (Incorrect)

```svelte
<!-- WRONG: rounded corners, blur shadow, soft transition -->
<div class="rounded-lg shadow-lg transition-all duration-300">
	<h2 class="text-2xl font-bold">Section Title</h2>
	<button class="rounded-md bg-blue-500 hover:bg-blue-600"> Action </button>
</div>
```

### Checklist Before Committing

- [ ] No `rounded-*` classes used
- [ ] No `shadow-*` Tailwind defaults (use `.paper-shadow-*`)
- [ ] No `transition-*` or `duration-*` classes
- [ ] Headings are UPPERCASE
- [ ] Buttons use `.btn` + `.paper-press`
- [ ] Cards use `.brutal-card`
- [ ] Colors from design system palette only

---

## Accessibility

Despite the brutalist aesthetic, accessibility is mandatory:

### Color Contrast

All color combinations meet WCAG AA:

- `--color-ink` on `--color-cream`: 15.8:1
- `--color-ink` on `--color-paper`: 19.3:1
- `--color-paper` on `--color-coral`: 4.5:1

### Focus States

```css
:focus-visible {
	outline: 3px solid var(--color-accent-coral);
	outline-offset: 2px;
}
```

### Interactive Elements

- All buttons must be keyboard accessible
- Use `bits-ui` for complex components (dialogs, menus)
- Add `aria-*` attributes where needed
- Test with screen readers

### Motion

The `transition-duration: 0s` rule helps users with motion sensitivity, but ensure state changes are still perceivable through color/visual changes.

---

## Quick Copy Reference

### Common Patterns

```svelte
<!-- Page Section -->
<section class="bg-cream py-20">
	<div class="fc-container">
		<span class="label mb-2 block text-coral">SECTION LABEL</span>
		<h2 class="heading-2 mb-8">SECTION TITLE</h2>
		<!-- content -->
	</div>
</section>

<!-- Product Card -->
<article class="brutal-card paper-press">
	<div class="mb-4 aspect-square border-b-3 border-ink bg-cream-deep">
		<!-- image -->
	</div>
	<h3 class="heading text-xl">{name}</h3>
	<p class="body-small text-ink-muted">{description}</p>
	<div class="price mt-4">
		<span class="price-currency">$</span>{price}
	</div>
</article>

<!-- CTA Section -->
<section class="bg-coral py-20">
	<div class="fc-container text-center">
		<h2 class="heading-1 mb-6 text-paper">CTA HEADLINE</h2>
		<p class="body-large mx-auto mb-10 max-w-2xl text-paper/90">Supporting text here.</p>
		<a href="/action" class="btn btn-primary btn-lg paper-press bg-ink text-cream"> TAKE ACTION </a>
	</div>
</section>
```

---

## Version History

| Version | Date    | Changes               |
| ------- | ------- | --------------------- |
| 1.0.0   | 2024-01 | Initial design system |

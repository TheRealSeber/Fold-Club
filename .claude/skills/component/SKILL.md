---
name: component
description: Creates Svelte components following the Fold Club brutalist design system. Use when creating new UI components, building reusable elements, or when the user asks to "create a component" or "build a card/button/etc."
---

When creating a Svelte component, follow this process:

## 1. Brutalist Checklist

Before writing any code, confirm these principles will be followed:

- **No rounded corners** - `border-radius: 0` is enforced globally
- **Hard shadows only** - Use `.paper-shadow-*` classes (no blur)
- **No transitions** - Instant state changes only
- **Design palette colors** - Cream/ink/accent colors only
- **Proper typography** - `.heading-*` and `.body-*` classes
- **Thick borders** - 3px borders (`border-3 border-ink`)

## 2. Component Structure

Create in `src/lib/components/ComponentName.svelte`:

```svelte
<script lang="ts">
	interface Props {
		// Define typed props
	}

	let { prop1, prop2 = 'default' }: Props = $props();
</script>

<!-- Use design system classes -->
<div class="brutal-card paper-shadow-md">
	<!-- content -->
</div>

<style>
	/* Only if component-specific styles needed */
</style>
```

## 3. Design System Classes Reference

**Containers:**

- `brutal-card` - Card with border
- `brutal-card-interactive paper-press` - Hoverable card
- `fc-container` - Max-width wrapper

**Buttons:**

- `btn btn-primary paper-press` - Primary action
- `btn btn-secondary paper-press` - Secondary action
- `btn btn-coral paper-press` - Coral accent
- `btn-lg`, `btn-sm` - Size variants

**Typography:**

- `heading-1`, `heading-2`, `heading-3` - Headings (uppercase)
- `body`, `body-large`, `body-small` - Body text
- `label` - Small uppercase labels

**Shadows:**

- `paper-shadow-sm`, `paper-shadow-md`, `paper-shadow-lg`
- `paper-press` - Interactive press effect

**Colors:**

- Backgrounds: `bg-cream`, `bg-cream-warm`, `bg-paper`, `bg-ink`
- Text: `text-ink`, `text-ink-soft`, `text-ink-muted`
- Accents: `text-coral`, `bg-coral`, `text-mint`, `bg-mint`, `text-gold`, `bg-gold`, `text-violet`, `bg-violet`

**Tags:**

- `tag tag-coral`, `tag tag-mint`, `tag tag-gold`, `tag tag-violet`

## 4. Validate with Autofixer

**ALWAYS** run `svelte-autofixer` before finalizing. Keep running until no issues remain.

## 5. Export Component

Add to `src/lib/components/index.ts`:

```typescript
export { default as ComponentName } from './ComponentName.svelte';
```

## Anti-Patterns (NEVER USE)

```svelte
<!-- WRONG -->
<div class="rounded-lg shadow-lg transition-all duration-300">
<button class="rounded-md hover:bg-blue-600">

<!-- CORRECT -->
<div class="brutal-card paper-shadow-lg">
<button class="btn btn-primary paper-press">
```

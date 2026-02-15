# Fold Club - Development Guidelines

## Project Overview

Fold Club is a specialized e-commerce platform for DIY papercraft kits (low-poly masks). The target audience includes Gen Z (meme masks), kids, and couples looking for creative date ideas.

## Tech Stack

- **Runtime**: Bun
- **Framework**: SvelteKit (Svelte 5 with runes)
- **Styling**: TailwindCSS v4 (CSS-first with `@theme` block)
- **Components**: bits-ui (headless primitives)
- **Database**: Drizzle ORM + PostgreSQL (Docker)
- **i18n**: @inlang/paraglide-js

---

## Design System Principles (MUST FOLLOW)

### The Brutalist Aesthetic

This project follows a **brutalist, paper-sharp** design language. Every UI element must adhere to these principles:

#### 1. NO ROUNDED CORNERS

```css
/* This is enforced globally - NEVER override */
border-radius: 0 !important;
```

Everything is a polygon. No soft edges. No `rounded-*` classes.

#### 2. HARD SHADOWS ONLY

Use offset shadows with NO blur. This simulates papercraft depth.

```css
/* Correct */
box-shadow: 5px 5px 0 var(--color-ink);

/* WRONG - never use blur */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
```

Use utility classes: `.paper-shadow-sm`, `.paper-shadow-md`, `.paper-shadow-lg`

#### 3. INSTANT INTERACTIONS

No soft transitions or fades. Hard cuts only.

```css
/* Enforced globally */
transition-duration: 0s !important;
```

#### 4. COLOR PALETTE

- **Backgrounds**: Cream tones (`bg-cream`, `bg-cream-warm`, `bg-paper`)
- **Text**: Ink blacks (`text-ink`, `text-ink-soft`, `text-ink-muted`)
- **Accents**: `coral`, `mint`, `gold`, `violet`

#### 5. TYPOGRAPHY

- **Headings**: Archivo Black, UPPERCASE, tight tracking
- **Body**: DM Sans, normal case
- Use classes: `.heading`, `.heading-1`, `.heading-2`, `.body`, `.label`

#### 6. INTERACTIVE ELEMENTS

Use `.paper-press` for buttons/cards - creates a "pressing paper" effect on click.

### Quick Reference

| Element          | Class Pattern                     |
| ---------------- | --------------------------------- |
| Primary button   | `btn btn-primary paper-press`     |
| Secondary button | `btn btn-secondary paper-press`   |
| Card             | `brutal-card paper-shadow-md`     |
| Heading          | `heading-1` or `heading-2`        |
| Label/Tag        | `tag tag-coral`                   |
| Border           | `border-3 border-ink` (3px solid) |

### Before Creating Any Component

1. Check `src/app.css` for existing utility classes
2. Read `docs/DESIGN_SYSTEM.md` for detailed guidelines
3. Use the `/component` skill for guided creation
4. ALWAYS run `svelte-autofixer` before finalizing code

---

## Svelte MCP Server Tools

You have access to comprehensive Svelte 5 and SvelteKit documentation via MCP:

### 1. list-sections

Use FIRST to discover available documentation. Returns titles, use_cases, and paths.

### 2. get-documentation

Retrieves full documentation for specific sections. Fetch ALL relevant sections for the task.

### 3. svelte-autofixer

**MUST use** whenever writing Svelte code. Keep calling until no issues remain.

### 4. playground-link

Generates Svelte Playground links. Only use after user confirmation and NEVER if code was written to project files.

---

## File Structure

```
src/
├── app.css              # Design system tokens & utilities
├── routes/
│   ├── +layout.svelte   # Global layout
│   └── +page.svelte     # Landing page
├── lib/
│   ├── components/      # Reusable UI components
│   ├── server/db/       # Drizzle client & schema
│   └── paraglide/       # i18n generated files
docs/
└── DESIGN_SYSTEM.md     # Detailed design reference
```

---

## Commands

```bash
bun run dev        # Start dev server
bun run build      # Production build
bun run check      # Type checking
bun run db:push    # Push schema to Supabase
bun run db:studio  # Open Drizzle Studio (connects to Supabase)
```

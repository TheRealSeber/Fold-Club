# OG Image & Favicon Guide

## ✅ What's Done

### Favicon
- **Created**: `static/favicon.svg`
- **Type**: SVG (scalable, works on all devices)
- **Design**: Brutalist "F" letter made of geometric paper folds
- **Added to**: `src/routes/+layout.svelte`

The favicon will now show in browser tabs!

---

## 📸 OG Images Needed

Open Graph images are used when sharing links on social media (Facebook, Twitter, LinkedIn, etc.).

### Required Images (1200x630px each):
1. `og-image-pl.png` - Home page (Polish)
2. `og-image-en.png` - Home page (English)
3. `og-puzzle3d-pl.png` - Puzzle 3D landing (Polish)
4. `og-puzzle3d-en.png` - Puzzle 3D landing (English)
5. `og-assembly-pl.png` - Assembly models landing (Polish)
6. `og-assembly-en.png` - Assembly models landing (English)
7. `og-papercraft-pl.png` - Papercraft landing (Polish)
8. `og-papercraft-en.png` - Papercraft landing (English)

---

## 🛠️ Method 1: Use the HTML Template (EASIEST)

I created `static/og-image-template.html` for you!

### Steps:
1. Open `static/og-image-template.html` in your browser
2. Click the buttons to switch between different versions (Home PL, Puzzle 3D EN, etc.)
3. **Right-click on the image** → "Save image as..."
4. Save as PNG with the correct filename (e.g., `og-image-pl.png`)
5. Move all PNG files to `static/` folder

**Note**: Some browsers may not capture at full 1200x630px. If this happens, use Method 2.

---

## 🛠️ Method 2: Screenshot with Browser DevTools

1. Open `static/og-image-template.html` in Chrome/Firefox
2. Open DevTools (F12)
3. Click "Toggle device toolbar" (Ctrl+Shift+M)
4. Set dimensions to **1200x630**
5. Click a button to generate an image version
6. **Take screenshot**:
   - Chrome: Right-click on element → "Capture node screenshot"
   - Firefox: Take full page screenshot, crop to 1200x630

---

## 🛠️ Method 3: Use Figma/Canva (BEST QUALITY)

### Design Specs:
- **Size**: 1200x630px
- **Fonts**:
  - Headers: Archivo Black (uppercase, tight spacing)
  - Body: DM Sans
- **Colors**:
  - Background: `#faf6f1` (cream)
  - Text: `#1a1614` (ink black)
  - Tags: `#ff6b5a` (coral), `#a7e8bd` (mint), `#ffd369` (gold)
- **Style**:
  - 6px solid borders (`#1a1614`)
  - Hard shadows: 10px offset, no blur
  - No rounded corners
- **Content**: Copy text from the HTML template buttons

### Figma Quick Start:
1. Create 1200x630 frame
2. Add rectangle: Fill `#faf6f1`, Stroke 6px `#1a1614`
3. Add hard shadow: X=10, Y=10, Blur=0, Color=`#1a1614`
4. Add text layers with proper fonts
5. Export as PNG

---

## 🛠️ Method 4: Programmatic Generation (ADVANCED)

Use `@vercel/og` or `satori` to generate OG images dynamically:

```bash
bun add @vercel/og
```

Create `src/routes/og/[type]/+server.ts`:
```typescript
import { ImageResponse } from '@vercel/og';

export async function GET({ params }) {
  return new ImageResponse(
    (
      <div style={{ /* your brutalist styles */ }}>
        <h1>Your title</h1>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

**Pros**: Dynamic, always up-to-date
**Cons**: Requires server-side rendering, more complex

---

## 🎨 Content for Each Image

Use these texts (already in the HTML template):

### Home PL (`og-image-pl.png`)
- Tag: PAPERCRAFT (coral)
- Title: PUZZLE 3D I MODELE DO SKLEJANIA
- Description: Geometryczne zwierzęta z papieru. Pre-cut, bez wycinania - tylko sklejanie.
- Stats: PRE-CUT, 1-4H, 3D

### Home EN (`og-image-en.png`)
- Tag: PAPERCRAFT (coral)
- Title: 3D PUZZLES & ASSEMBLY MODELS
- Description: Geometric animals from paper. Pre-cut, no cutting - just gluing.
- Stats: PRE-CUT, 1-4H, 3D

### Puzzle 3D PL (`og-puzzle3d-pl.png`)
- Tag: PUZZLE 3D (coral)
- Title: PUZZLE 3D Z PAPIERU
- Description: Geometryczne modele zwierząt do sklejania. Pre-cut, gotowe do złożenia.
- Stats: PRE-CUT, 4 Modele, LOW-POLY

### Puzzle 3D EN (`og-puzzle3d-en.png`)
- Tag: PUZZLE 3D (coral)
- Title: 3D PAPER PUZZLES
- Description: Geometric animal models to assemble. Pre-cut, ready to build.
- Stats: PRE-CUT, 4 Models, LOW-POLY

*(Continue with Assembly and Papercraft versions - see template HTML)*

---

## ✅ Final Checklist

After generating all images:

1. [ ] Place all 8 PNG files in `static/` folder
2. [ ] Verify files are exactly 1200x630px
3. [ ] Test on social media debuggers:
   - Facebook: https://developers.facebook.com/tools/debug/
   - Twitter: https://cards-dev.twitter.com/validator
   - LinkedIn: https://www.linkedin.com/post-inspector/
4. [ ] Images should be under 1MB each for best performance

---

## 🚀 Quick Win

**If you're in a hurry:**
1. Open the HTML template
2. Screenshot only 2 versions: `og-image-pl.png` and `og-image-en.png`
3. Copy these for the landing pages temporarily
4. Replace with proper versions later

The most important ones are the home page images - the landing page images can wait!

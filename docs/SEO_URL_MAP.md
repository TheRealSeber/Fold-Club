# SEO URL Structure
## Fold Club - Complete URL Map

**Last Updated:** January 29, 2026

---

## 🌍 URL PATTERN

### Polish (Default - No Prefix)
`https://foldclub.pl/[route]`

### English (EN Prefix)
`https://foldclub.pl/en/[route]`

---

## 📄 LANDING PAGES

### 1. Puzzle 3D (18,100 SV/mo)
- **Polish:** `https://foldclub.pl/sklep/puzzle-3d`
- **English:** `https://foldclub.pl/en/shop/puzzle-3d`
- **Target Keywords:** puzzle 3d, modele 3d, dekoracje 3d
- **File:** `src/routes/sklep/puzzle-3d/+page.svelte`

### 2. Modele do Sklejania (6,600 SV/mo)
- **Polish:** `https://foldclub.pl/sklep/modele-do-sklejania`
- **English:** `https://foldclub.pl/en/shop/assembly-models`
- **Target Keywords:** modele do sklejania, modele z papieru, modele z kartonu
- **File:** `src/routes/sklep/modele-do-sklejania/+page.svelte`

### 3. Papercraft (1,300 SV/mo) - TODO
- **Polish:** `https://foldclub.pl/sklep/papercraft`
- **English:** `https://foldclub.pl/en/shop/papercraft`
- **Target Keywords:** papercraft, papercraft zwierzęta
- **Status:** Not created yet

---

## 🛍️ PRODUCT DETAIL PAGES

All product pages follow the pattern:
`/sklep/[category]/[product-slug]`

### Love Swans (Łabędzie Miłości)
- **Polish:** `https://foldclub.pl/sklep/puzzle-3d/labedzie-milosci`
- **English:** `https://foldclub.pl/en/shop/puzzle-3d/love-swans`
- **Category:** puzzle-3d
- **SEO Key:** `swans`
- **Price:** 69 PLN

### Moai Head (Głowa Moai)
- **Polish:** `https://foldclub.pl/sklep/modele-do-sklejania/moai-glowa`
- **English:** `https://foldclub.pl/en/shop/assembly-models/moai-head`
- **Category:** modele-do-sklejania / assembly-models
- **SEO Key:** `moai`
- **Price:** 59 PLN

### Baby Dinosaur (Baby Dinozaur)
- **Polish:** `https://foldclub.pl/sklep/puzzle-3d/baby-dinozaur`
- **English:** `https://foldclub.pl/en/shop/puzzle-3d/baby-dinosaur`
- **Category:** puzzle-3d
- **SEO Key:** `dino`
- **Price:** 39 PLN

### Sphinx Cat (Sfinks Kot)
- **Polish:** `https://foldclub.pl/sklep/modele-do-sklejania/sfinks-kot`
- **English:** `https://foldclub.pl/en/shop/assembly-models/sphinx-cat`
- **Category:** modele-do-sklejania / assembly-models
- **SEO Key:** `sphinx`
- **Price:** 79 PLN

---

## 🔗 INTERNAL LINKING STRUCTURE

### Homepage
- Links to: `/sklep/puzzle-3d`, `/sklep/modele-do-sklejania`, `/sklep`
- Should include: Top keywords in hero section

### Shop Page (`/sklep`)
- Links to: Both category landing pages
- Links to: All 4 product detail pages

### Category Landing Pages
- **puzzle-3d** links to: Swans, Dino
- **modele-do-sklejania** links to: Moai, Sphinx
- Breadcrumb: Home → Shop → Category

### Product Detail Pages
- Breadcrumb: Home → Shop → Category → Product
- Related products section (TODO)
- Back to category link

---

## 🗺️ SITEMAP STRUCTURE (TODO)

```xml
<url>
  <loc>https://foldclub.pl/</loc>
  <priority>1.0</priority>
  <changefreq>weekly</changefreq>
</url>
<url>
  <loc>https://foldclub.pl/sklep</loc>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://foldclub.pl/sklep/puzzle-3d</loc>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://foldclub.pl/sklep/modele-do-sklejania</loc>
  <priority>0.8</priority>
</url>
<!-- 4 product detail pages -->
<url>
  <loc>https://foldclub.pl/sklep/puzzle-3d/labedzie-milosci</loc>
  <priority>0.7</priority>
</url>
<!-- Repeat for each product -->
```

---

## 📊 KEYWORD MAPPING

| URL | Primary Keyword | Monthly SV | KD | Status |
|-----|----------------|-----------|-----|---------|
| `/sklep/puzzle-3d` | puzzle 3d | 18,100 | 1 | ✅ Live |
| `/sklep/modele-do-sklejania` | modele do sklejania | 6,600 | - | ✅ Live |
| `/sklep/papercraft` | papercraft | 1,300 | 18 | ❌ TODO |
| `/sklep/puzzle-3d/labedzie-milosci` | puzzle 3d labedzie | - | - | ✅ Live |
| `/sklep/puzzle-3d/baby-dinozaur` | puzzle 3d dinozaur | - | - | ✅ Live |
| `/sklep/modele-do-sklejania/moai-glowa` | model moai | - | - | ✅ Live |
| `/sklep/modele-do-sklejania/sfinks-kot` | model sfinks | - | - | ✅ Live |

---

## 🔍 HREFLANG IMPLEMENTATION

Every page includes:
```html
<link rel="alternate" hreflang="pl" href="https://foldclub.pl/[url-pl]" />
<link rel="alternate" hreflang="en" href="https://foldclub.pl/en/[url-en]" />
<link rel="alternate" hreflang="x-default" href="https://foldclub.pl/[url-pl]" />
```

**Default locale:** Polish (pl)
**x-default:** Points to Polish version

---

## 🎯 SEO CHECKLIST PER PAGE

✅ **Landing Pages (puzzle-3d, modele-do-sklejania):**
- [x] Title tag with target keyword
- [x] Meta description (150-160 chars)
- [x] Meta keywords
- [x] Canonical URL
- [x] Hreflang tags (pl/en/x-default)
- [x] Breadcrumb Schema.org markup
- [x] Open Graph tags
- [x] H1 with target keyword
- [x] SEO content section (200+ words)
- [x] Internal links to products
- [x] Brutalist design maintained

✅ **Product Detail Pages:**
- [x] Dynamic title from `m.seo_[product]_title()`
- [x] Dynamic description from `m.seo_[product]_description()`
- [x] Canonical URL
- [x] Hreflang tags
- [x] Product Schema.org markup
- [x] Breadcrumb Schema.org markup
- [x] Open Graph product tags
- [x] H1 = product name
- [x] Price display
- [x] Add to cart button
- [x] Product specs (difficulty, time)
- [x] Brutalist design maintained

---

## 📈 EXPECTED TRAFFIC FLOW

```
Google Search: "puzzle 3d"
         ↓
Landing Page: /sklep/puzzle-3d
         ↓
Product: /sklep/puzzle-3d/labedzie-milosci OR /sklep/puzzle-3d/baby-dinozaur
         ↓
Add to Cart
         ↓
Checkout
```

```
Google Search: "modele do sklejania"
         ↓
Landing Page: /sklep/modele-do-sklejania
         ↓
Product: /sklep/modele-do-sklejania/moai-glowa OR /sklep/modele-do-sklejania/sfinks-kot
         ↓
Add to Cart
         ↓
Checkout
```

---

## 🚀 NEXT STEPS

1. **Test All URLs Locally**
   ```bash
   bun run dev
   # Visit each URL and verify:
   # - Page loads correctly
   # - Meta tags present in source
   # - Hreflang tags correct
   # - Schema markup validates
   # - Language switching works
   ```

2. **Update robots.txt**
   ```
   User-agent: *
   Allow: /

   Sitemap: https://foldclub.pl/sitemap.xml
   ```

3. **Generate sitemap.xml**
   - Use SvelteKit endpoint
   - Include all pages with proper priority
   - Update weekly

4. **Submit to Google Search Console**
   - Verify domain ownership
   - Submit sitemap
   - Monitor indexing
   - Check for errors

5. **Monitor Rankings**
   - Track "puzzle 3d" position
   - Track "modele do sklejania" position
   - Track "papercraft" position
   - Monitor organic traffic in GA4

---

**Total URLs Created:** 6 (2 landing pages + 4 product pages)
**Total Addressable Traffic:** 24,700 searches/month (base), 72,600 in December
**Implementation Status:** Phase 2 Core Complete ✅

# Search Console Indexing Issues - Fix Summary

**Date:** 2026-02-02
**Status:** Fixed

## Issues Identified

### 1. Alternative Page with Valid Canonical Tag

**Affected URLs:**

- `https://www.foldclub.pl/`
- `https://www.foldclub.pl/en/products/sphinx-cat`

**Root Cause:**
The site is served from `www.foldclub.pl` (with www), but the code was generating canonical URLs pointing to `foldclub.pl` (without www). This created a mismatch where:

- Actual URL: `https://www.foldclub.pl/`
- Canonical tag: `<link rel="canonical" href="https://foldclub.pl/" />`

Google interpreted the www version as an "alternative" instead of the canonical, causing indexing confusion.

**Verification:**

```bash
# Non-www redirects to www
curl -sI https://foldclub.pl/
# HTTP/2 307
# location: https://www.foldclub.pl/

# www version is the actual site
curl -sI https://www.foldclub.pl/
# HTTP/2 200
```

### 2. Page Contains Redirect

**Affected URLs:**

- `https://foldclub.pl/en//` (double slash)
- `http://foldclub.pl/` (HTTP)
- `http://www.foldclub.pl/` (HTTP with www)

**Analysis:**
These are legitimate redirects that are working correctly:

- HTTP → HTTPS (automatic via Vercel)
- `foldclub.pl` → `www.foldclub.pl` (automatic via Vercel)
- `/en//` → `/en/` (SvelteKit URL normalization)

Google reports these as "Page contains redirect" which is informational, not an error. These URLs were likely discovered from:

- Old external links
- Crawling artifacts
- Historical sitemap data

## Fix Applied

### Changed Domain Configuration

**File:** `src/lib/config/seo.ts:10`

```typescript
// Before
export const SITE_CONFIG = {
  name: 'Fold Club',
  domain: 'foldclub.pl',
  defaultLocale: 'pl',
  locales: ['pl', 'en'] as const
} as const;

// After
export const SITE_CONFIG = {
  name: 'Fold Club',
  domain: 'www.foldclub.pl',
  defaultLocale: 'pl',
  locales: ['pl', 'en'] as const
} as const;
```

## Impact

This single change fixes all canonical URL generation across the site:

### Canonical URLs (SEOHead.svelte)

```typescript
// Now generates
<link rel="canonical" href="https://www.foldclub.pl/" />
<link rel="canonical" href="https://www.foldclub.pl/en/products/sphinx-cat" />
```

### Open Graph URLs

```html
<meta property="og:url" content="https://www.foldclub.pl/" />
```

### Hreflang Tags

```html
<link rel="alternate" hreflang="pl" href="https://www.foldclub.pl/" />
<link rel="alternate" hreflang="en" href="https://www.foldclub.pl/en" />
```

### OG Images

```html
<meta property="og:image" content="https://www.foldclub.pl/og-image.png" />
```

## Expected Results

After deploying this fix and requesting reindexing in Search Console:

1. **"Alternative page with valid canonical tag" errors will resolve** - All pages will have canonical URLs matching their actual URLs
2. **"Page contains redirect" entries will remain** - These are informational and represent old/malformed URLs that correctly redirect. This is expected behavior.

## Next Steps

1. Deploy the change to production
2. Request validation in Search Console (click "Validate Fix" button)
3. Submit updated sitemap (if one exists)
4. Monitor indexing status over the next 7-14 days

## Additional Recommendations

### Optional: Add Sitemap

Consider adding a sitemap.xml to help Google discover and index pages more efficiently:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://www.foldclub.pl/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://www.foldclub.pl/en" />
    <xhtml:link rel="alternate" hreflang="pl" href="https://www.foldclub.pl/" />
  </url>
  <!-- Add more URLs -->
</urlset>
```

### Optional: Vercel Configuration

While not necessary (redirects work correctly), you could explicitly document the redirect behavior in a `vercel.json`:

```json
{
  "redirects": [
    {
      "source": "/:path(.*)",
      "has": [
        {
          "type": "host",
          "value": "foldclub.pl"
        }
      ],
      "destination": "https://www.foldclub.pl/:path",
      "permanent": true
    }
  ]
}
```

## Technical Notes

### How getFullUrl Works

The `getFullUrl()` function in `src/lib/config/seo.ts:355-374` generates all canonical and alternate URLs. By changing `SITE_CONFIG.domain`, all generated URLs now use `www.foldclub.pl`.

### Internationalization Handling

The site uses Paraglide for i18n with:

- Default locale (Polish): `https://www.foldclub.pl/`
- English locale: `https://www.foldclub.pl/en/`
- Localized paths: `/sklep` (pl) vs `/en/shop` (en)

All SEO tags properly reflect these patterns with self-referential canonicals per Google's i18n guidelines.

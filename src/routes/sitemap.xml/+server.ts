import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const baseUrl = 'https://foldclub.pl';
  const lastmod = new Date().toISOString().split('T')[0];

  const staticPages = [
    { url: '', priority: 1.0, changefreq: 'daily' },
    { url: 'shop', priority: 0.9, changefreq: 'daily' },
    { url: 'gallery', priority: 0.6, changefreq: 'weekly' },
    { url: 'faq', priority: 0.5, changefreq: 'monthly' },
    { url: 'shipping', priority: 0.4, changefreq: 'monthly' },
    { url: 'contact', priority: 0.4, changefreq: 'monthly' },
    { url: 'returns', priority: 0.4, changefreq: 'monthly' },
    { url: 'privacy', priority: 0.3, changefreq: 'yearly' },
    { url: 'terms', priority: 0.3, changefreq: 'yearly' }
  ];

  const locales = ['pl', 'en'];

  // Generate URLs for all pages in all languages
  const urls = staticPages.flatMap((page) => {
    return locales.map((locale) => {
      const path = page.url ? `/${page.url}` : '/';
      // Default locale (pl) has no prefix, en has /en prefix
      const localizedPath = locale === 'pl' ? path : `/en${path}`;
      const loc = `${baseUrl}${localizedPath}`;

      // Generate alternate links for hreflang
      const alternates = locales
        .map((altLocale) => {
          const altPath = altLocale === 'pl' ? path : `/en${path}`;
          const altUrl = `${baseUrl}${altPath}`;
          return `    <xhtml:link rel="alternate" hreflang="${altLocale}" href="${altUrl}"/>`;
        })
        .join('\n');

      // Add x-default pointing to Polish (default) version
      const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${path}"/>`;

      return {
        loc,
        lastmod,
        changefreq: page.changefreq,
        priority: page.priority,
        alternates: `${alternates}\n${xDefault}`
      };
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
${url.alternates}
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=0, s-maxage=3600'
    }
  });
};

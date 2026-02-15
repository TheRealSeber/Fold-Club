import type { RequestHandler } from './$types';
import { getAllProducts } from '$lib/server/db/products';

export const GET: RequestHandler = async () => {
  const baseUrl = 'https://www.foldclub.pl';
  const lastmod = new Date().toISOString().split('T')[0];

  // Static pages with Polish translations
  const staticPages = [
    { urlPL: '', urlEN: '', priority: 1.0, changefreq: 'daily' },
    { urlPL: 'sklep', urlEN: 'shop', priority: 0.9, changefreq: 'daily' },
    { urlPL: 'galeria', urlEN: 'gallery', priority: 0.6, changefreq: 'weekly' },
    { urlPL: 'faq', urlEN: 'faq', priority: 0.5, changefreq: 'monthly' },
    { urlPL: 'wysylka', urlEN: 'shipping', priority: 0.4, changefreq: 'monthly' },
    { urlPL: 'kontakt', urlEN: 'contact', priority: 0.4, changefreq: 'monthly' },
    { urlPL: 'zwroty', urlEN: 'returns', priority: 0.4, changefreq: 'monthly' },
    { urlPL: 'prywatnosc', urlEN: 'privacy', priority: 0.3, changefreq: 'yearly' },
    { urlPL: 'regulamin', urlEN: 'terms', priority: 0.3, changefreq: 'yearly' }
  ];

  // SEO Landing Pages with Polish translations
  const landingPages = [
    {
      urlPL: 'sklep/puzzle-3d',
      urlEN: 'shop/puzzle-3d',
      priority: 0.9,
      changefreq: 'weekly'
    },
    {
      urlPL: 'sklep/modele-do-sklejania',
      urlEN: 'shop/assembly-models',
      priority: 0.9,
      changefreq: 'weekly'
    },
    {
      urlPL: 'sklep/papercraft',
      urlEN: 'shop/papercraft',
      priority: 0.8,
      changefreq: 'weekly'
    }
  ];

  // Dynamic Product Pages from DB — pair EN and PL slugs by product ID
  const [productsEN, productsPL] = await Promise.all([
    getAllProducts('en'),
    getAllProducts('pl'),
  ]);
  const plByProductId = new Map(productsPL.map((p) => [p.id, p.localizedSlug]));
  const productPages = productsEN.map((product) => ({
    urlPL: `produkty/${plByProductId.get(product.id) ?? product.slug}`,
    urlEN: `products/${product.localizedSlug}`,
    priority: 0.8,
    changefreq: 'weekly'
  }));

  // Generate URLs for all pages in both languages
  const allPages = [...staticPages, ...landingPages, ...productPages];

  const urls = allPages.flatMap((page) => {
    const pathPL = page.urlPL ? `/${page.urlPL}` : '/';
    const pathEN = page.urlEN ? `/${page.urlEN}` : '';

    return [
      // Polish version (no prefix)
      {
        loc: `${baseUrl}${pathPL}`,
        lastmod,
        changefreq: page.changefreq,
        priority: page.priority,
        alternates: `    <xhtml:link rel="alternate" hreflang="pl" href="${baseUrl}${pathPL}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en${pathEN}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${pathPL}"/>`
      },
      // English version (with /en prefix)
      {
        loc: `${baseUrl}/en${pathEN}`,
        lastmod,
        changefreq: page.changefreq,
        priority: page.priority,
        alternates: `    <xhtml:link rel="alternate" hreflang="pl" href="${baseUrl}${pathPL}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en${pathEN}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${pathPL}"/>`
      }
    ];
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

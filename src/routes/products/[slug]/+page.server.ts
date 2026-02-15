import { error, redirect } from '@sveltejs/kit';
import { getLocale, localizeHref } from '$lib/paraglide/runtime';
import { getProductBySlug, getProductBySlugAnyLocale } from '$lib/server/db/products';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const locale = getLocale();
  const product = await getProductBySlug(params.slug, locale);

  if (product) {
    const seoSuffix = locale === 'pl' ? 'Puzzle 3D | Fold Club' : '3D Puzzle | Fold Club';
    return {
      product,
      seoTitle: `${product.name} - ${seoSuffix}`,
      seoDescription: product.description
    };
  }

  // Slug might belong to another locale — find and redirect.
  // localizeHref relies on the Paraglide AsyncLocalStorage context set by the middleware.
  const fallback = await getProductBySlugAnyLocale(params.slug, locale);
  if (fallback) redirect(302, localizeHref(`/products/${fallback.localizedSlug}`));

  error(404, 'Product not found');
};

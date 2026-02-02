import { redirect } from '@sveltejs/kit';
import { getProductBySlug, getProductBySlugFallback } from '$lib/data/products';
import { getLocale } from '$lib/paraglide/runtime';
import type { PageLoad } from './$types';
import type { Product } from '$lib/data/products';

export const load: PageLoad = ({ params, url }) => {
  const locale = getLocale();
  const { slug } = params;

  let product: Product | undefined = getProductBySlug(slug, locale);

  if (!product) {
    product = getProductBySlugFallback(slug);

    if (product) {
      const correctSlug = locale === 'pl' ? product.slugPL : product.slugEN;
      const pathSegments = url.pathname.split('/');
      pathSegments[pathSegments.length - 1] = correctSlug;
      redirect(302, pathSegments.join('/'));
    }
  }

  return { product };
};

import { getLocale } from '$lib/paraglide/runtime';
import { getAllProducts } from '$lib/server/db/products';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const locale = getLocale();
  const products = await getAllProducts(locale);
  return { products };
};

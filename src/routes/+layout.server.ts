import { getLocale } from '$lib/paraglide/runtime';
import { getAllProducts } from '$lib/server/db/products';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
  const locale = getLocale();
  const products = await getAllProducts(locale);
  return { products };
};

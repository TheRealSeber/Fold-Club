import { eq, and } from 'drizzle-orm';
import { db } from './index';
import { products, productTranslations } from './schema';

export type Locale = 'en' | 'pl';

// Shape returned by all product queries - flat for easy use in templates
export type ProductWithTranslation = {
  id: string;
  slug: string; // canonical EN slug
  stripeProductId: string;
  stripePriceId: string;
  priceAmount: number; // grosze
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: '1-2' | '2-3' | '3-4';
  tagColor: 'coral' | 'mint' | 'gold' | 'violet';
  category: 'couples' | 'kids' | 'statement';
  isActive: boolean;
  // From translation
  localizedSlug: string;
  name: string;
  description: string;
  tag: string;
};

function mergeTranslation(
  product: typeof products.$inferSelect,
  translation: typeof productTranslations.$inferSelect
): ProductWithTranslation {
  return {
    id: product.id,
    slug: product.slug,
    stripeProductId: product.stripeProductId,
    stripePriceId: product.stripePriceId,
    priceAmount: product.priceAmount,
    difficulty: product.difficulty,
    timeEstimate: product.timeEstimate,
    tagColor: product.tagColor,
    category: product.category,
    isActive: product.isActive,
    localizedSlug: translation.slug,
    name: translation.name,
    description: translation.description,
    tag: translation.tag
  };
}

/** Fetch all active products for a given locale. */
export async function getAllProducts(locale: Locale): Promise<ProductWithTranslation[]> {
  const rows = await db
    .select()
    .from(products)
    .innerJoin(
      productTranslations,
      and(eq(productTranslations.productId, products.id), eq(productTranslations.locale, locale))
    )
    .where(eq(products.isActive, true));

  return rows.map((r) => mergeTranslation(r.products, r.product_translations));
}

/**
 * Fetch a single product by its localized slug and locale.
 * Returns null if not found.
 */
export async function getProductBySlug(
  slug: string,
  locale: Locale
): Promise<ProductWithTranslation | null> {
  const rows = await db
    .select()
    .from(products)
    .innerJoin(
      productTranslations,
      and(
        eq(productTranslations.productId, products.id),
        eq(productTranslations.locale, locale),
        eq(productTranslations.slug, slug)
      )
    )
    .where(eq(products.isActive, true))
    .limit(1);

  if (rows.length === 0) return null;
  return mergeTranslation(rows[0].products, rows[0].product_translations);
}

/**
 * Fetch a product by UUID (used in cart/checkout lookups).
 */
export async function getProductById(
  id: string,
  locale: Locale
): Promise<ProductWithTranslation | null> {
  const rows = await db
    .select()
    .from(products)
    .innerJoin(
      productTranslations,
      and(eq(productTranslations.productId, products.id), eq(productTranslations.locale, locale))
    )
    .where(and(eq(products.id, id), eq(products.isActive, true)))
    .limit(1);

  if (rows.length === 0) return null;
  return mergeTranslation(rows[0].products, rows[0].product_translations);
}

/** Find a product by slug in any locale, return it translated in the target locale. */
export async function getProductBySlugAnyLocale(
  slug: string,
  targetLocale: Locale
): Promise<ProductWithTranslation | null> {
  // Find in EN first (canonical), then PL
  for (const tryLocale of ['en', 'pl'] as Locale[]) {
    const rows = await db
      .select()
      .from(products)
      .innerJoin(
        productTranslations,
        and(
          eq(productTranslations.productId, products.id),
          eq(productTranslations.locale, tryLocale),
          eq(productTranslations.slug, slug)
        )
      )
      .where(eq(products.isActive, true))
      .limit(1);

    if (rows.length > 0) {
      // Found the product - now get its translation in targetLocale
      return getProductById(rows[0].products.id, targetLocale);
    }
  }
  return null;
}

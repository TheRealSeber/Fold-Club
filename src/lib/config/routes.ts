/**
 * Centralized Routes Configuration
 * Single source of truth for all application routes and metadata
 */

export const ROUTES = {
  HOME: '/',
  SHOP: '/shop',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDER: '/order',
  GALLERY: '/gallery',

  // Info pages
  FAQ: '/faq',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  SHIPPING: '/shipping',
  RETURNS: '/returns'
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteValue = (typeof ROUTES)[RouteKey];

/**
 * Page metadata configuration
 * Used for dynamic title/subtitle generation in layouts
 */
export interface PageMetadata {
  titleKey: string;
  subtitleKey?: string;
}

export const PAGE_METADATA: Record<string, PageMetadata> = {
  [ROUTES.HOME]: {
    titleKey: 'page_title',
    subtitleKey: 'hero_description'
  },
  [ROUTES.SHOP]: {
    titleKey: 'shop_title',
    subtitleKey: 'shop_subtitle'
  },
  '/sklep': {
    titleKey: 'shop_title',
    subtitleKey: 'shop_subtitle'
  },
  [ROUTES.CART]: {
    titleKey: 'cart_title',
    subtitleKey: 'cart_subtitle'
  },
  '/koszyk': {
    titleKey: 'cart_title',
    subtitleKey: 'cart_subtitle'
  },
  [ROUTES.CHECKOUT]: {
    titleKey: 'checkout_title',
    subtitleKey: 'checkout_subtitle'
  },
  '/kasa': {
    titleKey: 'checkout_title',
    subtitleKey: 'checkout_subtitle'
  },
  [ROUTES.ORDER]: {
    titleKey: 'order_title',
    subtitleKey: 'order_subtitle'
  },
  '/zamowienie': {
    titleKey: 'order_title',
    subtitleKey: 'order_subtitle'
  },
  [ROUTES.GALLERY]: {
    titleKey: 'gallery_title',
    subtitleKey: 'gallery_subtitle'
  },
  '/galeria': {
    titleKey: 'gallery_title',
    subtitleKey: 'gallery_subtitle'
  },
  [ROUTES.FAQ]: {
    titleKey: 'faq_title',
    subtitleKey: 'faq_subtitle'
  },
  [ROUTES.CONTACT]: {
    titleKey: 'contact_title',
    subtitleKey: 'contact_subtitle'
  },
  '/kontakt': {
    titleKey: 'contact_title',
    subtitleKey: 'contact_subtitle'
  },
  [ROUTES.PRIVACY]: {
    titleKey: 'privacy_title',
    subtitleKey: 'privacy_subtitle'
  },
  '/prywatnosc': {
    titleKey: 'privacy_title',
    subtitleKey: 'privacy_subtitle'
  },
  [ROUTES.TERMS]: {
    titleKey: 'terms_title',
    subtitleKey: 'terms_subtitle'
  },
  '/warunki': {
    titleKey: 'terms_title',
    subtitleKey: 'terms_subtitle'
  },
  [ROUTES.SHIPPING]: {
    titleKey: 'shipping_title',
    subtitleKey: 'shipping_subtitle'
  },
  '/wysylka': {
    titleKey: 'shipping_title',
    subtitleKey: 'shipping_subtitle'
  },
  [ROUTES.RETURNS]: {
    titleKey: 'returns_title',
    subtitleKey: 'returns_subtitle'
  },
  '/zwroty': {
    titleKey: 'returns_title',
    subtitleKey: 'returns_subtitle'
  }
};

/**
 * Helper to get page metadata by route path
 */
export function getPageMetadata(pathname: string): PageMetadata | null {
  return PAGE_METADATA[pathname as RouteValue] || null;
}

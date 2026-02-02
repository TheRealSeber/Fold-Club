/**
 * SEO Configuration
 * Centralized SEO metadata for all routes and languages
 */

import type { RouteValue } from './routes';
import { ROUTES } from './routes';

export const SITE_CONFIG = {
  name: 'Fold Club',
  domain: 'www.foldclub.pl',
  defaultLocale: 'pl',
  locales: ['pl', 'en'] as const
} as const;

export type Locale = (typeof SITE_CONFIG.locales)[number];

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
}

export interface LocalizedSEO {
  pl: SEOMetadata;
  en: SEOMetadata;
}

/**
 * Path mappings for internationalized URLs
 * Maps locale-specific paths to canonical keys
 */
export const PATH_MAPPINGS: Record<string, { pl: string; en: string }> = {
  // Landing pages
  landing_puzzle3d: {
    pl: '/sklep/puzzle-3d',
    en: '/shop/puzzle-3d'
  },
  landing_assembly: {
    pl: '/sklep/modele-do-sklejania',
    en: '/shop/assembly-models'
  },
  landing_papercraft: {
    pl: '/sklep/papercraft',
    en: '/shop/papercraft'
  },
  // Main routes with Polish translations
  shop_route: {
    pl: '/sklep',
    en: '/shop'
  },
  cart_route: {
    pl: '/koszyk',
    en: '/cart'
  },
  checkout_route: {
    pl: '/kasa',
    en: '/checkout'
  },
  order_route: {
    pl: '/zamowienie',
    en: '/order'
  },
  gallery_route: {
    pl: '/galeria',
    en: '/gallery'
  },
  contact_route: {
    pl: '/kontakt',
    en: '/contact'
  },
  privacy_route: {
    pl: '/prywatnosc',
    en: '/privacy'
  },
  terms_route: {
    pl: '/warunki',
    en: '/terms'
  },
  shipping_route: {
    pl: '/wysylka',
    en: '/shipping'
  },
  returns_route: {
    pl: '/zwroty',
    en: '/returns'
  }
};

/**
 * Reverse mapping: path -> canonical key
 */
const REVERSE_PATH_MAP: Record<string, string> = {};
Object.entries(PATH_MAPPINGS).forEach(([key, paths]) => {
  REVERSE_PATH_MAP[paths.pl] = key;
  REVERSE_PATH_MAP[paths.en] = key;
});

/**
 * SEO metadata for each route in both languages
 * Includes both standard routes and landing pages
 */
type SEOKey = RouteValue | keyof typeof PATH_MAPPINGS;

export const SEO_DATA: Record<SEOKey, LocalizedSEO> = {
  [ROUTES.HOME]: {
    pl: {
      title: 'Puzzle 3D i Modele do Sklejania z Papieru | Fold Club',
      description:
        'Puzzle 3D papercraft - geometryczne modele do sklejania z papieru. Moai 🗿, dinozaur, sfinks. Pre-cut, gotowe zestawy. Sklejanie bez wycinania - dla dorosłych i dzieci.',
      keywords:
        'puzzle 3d, modele do sklejania, papercraft, modele z papieru do sklejania, modele z papieru, składanki z papieru, geometryczne zwierzęta',
      ogImage: '/og-image-pl.png'
    },
    en: {
      title: '3D Puzzles & Paper Assembly Models | Fold Club',
      description:
        '3D papercraft puzzles - geometric assembly models from paper. Moai 🗿, dinosaur, sphinx. Pre-cut kits ready to build. No cutting required - for adults and kids.',
      keywords:
        '3d puzzles, assembly models, papercraft, paper models to glue, paper crafts, geometric animals',
      ogImage: '/og-image-en.png'
    }
  },
  [ROUTES.SHOP]: {
    pl: {
      title: 'Sklep - Puzzle 3D i Modele do Sklejania | Fold Club',
      description:
        'Odkryj nasze puzzle 3D i modele do sklejania - pre-cut, gotowe do złożenia. Geometryczne zwierzęta z papieru. Bez wycinania, tylko sklejanie.',
      keywords: 'puzzle 3d, modele do sklejania, papercraft, modele z papieru, zestawy diy'
    },
    en: {
      title: 'Shop - 3D Puzzles & Assembly Models | Fold Club',
      description:
        'Discover our 3D puzzles and assembly models - pre-cut, ready to build. Geometric animals from paper. No cutting, just gluing.',
      keywords: '3d puzzles, assembly models, papercraft, paper models, diy kits'
    }
  },
  [ROUTES.GALLERY]: {
    pl: {
      title: 'Galeria - Dzieła Naszych Twórców | Fold Club',
      description:
        'Zobacz co stworzyła nasza społeczność. Inspiracje i realizacje projektów papercraft.',
      keywords: 'galeria papercraft, inspiracje, projekty diy, realizacje'
    },
    en: {
      title: 'Gallery - Creations by Our Community | Fold Club',
      description:
        'See what our community has created. Papercraft inspiration and project showcases.',
      keywords: 'papercraft gallery, inspiration, diy projects, showcases'
    }
  },
  [ROUTES.CART]: {
    pl: {
      title: 'Koszyk | Fold Club',
      description: 'Twój koszyk z zestawami papercraft.'
    },
    en: {
      title: 'Cart | Fold Club',
      description: 'Your papercraft kits cart.'
    }
  },
  [ROUTES.CHECKOUT]: {
    pl: {
      title: 'Kasa | Fold Club',
      description: 'Dokończ swoje zamówienie zestawów papercraft.'
    },
    en: {
      title: 'Checkout | Fold Club',
      description: 'Complete your papercraft kits order.'
    }
  },
  [ROUTES.ORDER]: {
    pl: {
      title: 'Zamówienie | Fold Club',
      description: 'Dokończ swoje zamówienie zestawów papercraft.'
    },
    en: {
      title: 'Order | Fold Club',
      description: 'Complete your papercraft kits order.'
    }
  },
  [ROUTES.FAQ]: {
    pl: {
      title: 'FAQ - Najczęściej Zadawane Pytania | Fold Club',
      description: 'Znajdź odpowiedzi na pytania o nasze zestawy papercraft, wysyłkę i składanie.',
      keywords: 'faq papercraft, pytania, pomoc, jak składać'
    },
    en: {
      title: 'FAQ - Frequently Asked Questions | Fold Club',
      description: 'Find answers about our papercraft kits, shipping and assembly.',
      keywords: 'papercraft faq, questions, help, how to fold'
    }
  },
  [ROUTES.CONTACT]: {
    pl: {
      title: 'Kontakt | Fold Club',
      description: 'Skontaktuj się z nami. Odpowiadamy na wszystkie pytania o papercraft.',
      keywords: 'kontakt, pomoc, wsparcie'
    },
    en: {
      title: 'Contact | Fold Club',
      description: 'Get in touch with us. We answer all questions about papercraft.',
      keywords: 'contact, help, support'
    }
  },
  [ROUTES.SHIPPING]: {
    pl: {
      title: 'Wysyłka i Dostawa | Fold Club',
      description: 'Informacje o wysyłce zestawów papercraft. Szybka dostawa w całej Polsce i UE.',
      keywords: 'wysyłka, dostawa, czas dostawy'
    },
    en: {
      title: 'Shipping & Delivery | Fold Club',
      description: 'Papercraft kits shipping information. Fast delivery across Poland and EU.',
      keywords: 'shipping, delivery, delivery time'
    }
  },
  [ROUTES.RETURNS]: {
    pl: {
      title: 'Zwroty i Reklamacje | Fold Club',
      description: 'Polityka zwrotów i reklamacji. 14 dni na zwrot bez podania przyczyny.',
      keywords: 'zwroty, reklamacje, polityka zwrotów'
    },
    en: {
      title: 'Returns & Complaints | Fold Club',
      description: 'Returns and complaints policy. 14 days no-questions-asked returns.',
      keywords: 'returns, complaints, return policy'
    }
  },
  [ROUTES.PRIVACY]: {
    pl: {
      title: 'Polityka Prywatności | Fold Club',
      description: 'Polityka prywatności i ochrony danych osobowych.'
    },
    en: {
      title: 'Privacy Policy | Fold Club',
      description: 'Privacy policy and personal data protection.'
    }
  },
  [ROUTES.TERMS]: {
    pl: {
      title: 'Regulamin | Fold Club',
      description: 'Regulamin sklepu i warunki korzystania z serwisu.'
    },
    en: {
      title: 'Terms & Conditions | Fold Club',
      description: 'Shop terms and conditions of service.'
    }
  },
  // Landing pages with internationalized URLs
  landing_puzzle3d: {
    pl: {
      title: 'Puzzle 3D z Papieru - Geometryczne Modele do Sklejania | Fold Club',
      description:
        'Puzzle 3D z papieru - geometryczne modele zwierząt do sklejania. Pre-cut, gotowe do złożenia - bez wycinania. Dekoracje 3D na ścianę dla dorosłych i dzieci.',
      keywords:
        'puzzle 3d, modele do sklejania, papercraft, modele z papieru, geometryczne zwierzęta, dekoracje 3d',
      ogImage: '/og-puzzle3d-pl.png'
    },
    en: {
      title: '3D Paper Puzzles - Geometric Assembly Models | Fold Club',
      description:
        'Geometric animal models to assemble. Pre-cut, ready to build - no cutting required. 3D wall decorations for adults and kids.',
      keywords:
        '3d puzzles, assembly models, papercraft, paper models, geometric animals, 3d decorations',
      ogImage: '/og-puzzle3d-en.png'
    }
  },
  landing_assembly: {
    pl: {
      title: 'Modele do Sklejania z Papieru - Pre-Cut Zestawy DIY | Fold Club',
      description:
        'Modele 3D z papieru do sklejania. Wszystkie elementy pre-cut - wystarczy skleić i podziwiać. Idealne hobby dla dorosłych, par i dzieci.',
      keywords:
        'modele do sklejania, modele z papieru, modele z papieru, zestawy diy, papercraft, sklejanie modeli',
      ogImage: '/og-assembly-pl.png'
    },
    en: {
      title: 'Paper Models to Assemble - Pre-Cut DIY Kits | Fold Club',
      description:
        'Paper 3D models to assemble. All pieces pre-cut - just glue and admire. Perfect hobby for adults, couples, and kids.',
      keywords: 'assembly models, paper models, paper crafts, diy kits, papercraft, model building',
      ogImage: '/og-assembly-en.png'
    }
  },
  landing_papercraft: {
    pl: {
      title: 'Papercraft - Modele z Papieru Geometryczne Zestawy DIY | Fold Club',
      description:
        'Papercraft to sztuka tworzenia modeli 3D z papieru. Nasze zestawy łączą geometryczny design z prostym składaniem. Low-poly zwierzęta i dekoracje dla każdego.',
      keywords:
        'papercraft, papercraft zwierzęta, modele z papieru, low poly, geometryczne modele, zestawy diy',
      ogImage: '/og-papercraft-pl.png'
    },
    en: {
      title: 'Papercraft - Paper Models Geometric DIY Kits | Fold Club',
      description:
        'Papercraft is the art of creating 3D models from paper. Our kits combine geometric design with simple assembly. Low-poly animals and decorations for everyone.',
      keywords:
        'papercraft, papercraft animals, paper models, low poly, geometric models, diy kits',
      ogImage: '/og-papercraft-en.png'
    }
  }
};

/**
 * Map route keys to ROUTES constants
 */
const ROUTE_KEY_TO_CONSTANT: Record<string, RouteValue> = {
  shop_route: ROUTES.SHOP,
  cart_route: ROUTES.CART,
  checkout_route: ROUTES.CHECKOUT,
  order_route: ROUTES.ORDER,
  gallery_route: ROUTES.GALLERY,
  contact_route: ROUTES.CONTACT,
  privacy_route: ROUTES.PRIVACY,
  terms_route: ROUTES.TERMS,
  shipping_route: ROUTES.SHIPPING,
  returns_route: ROUTES.RETURNS
};

/**
 * Get SEO metadata for a route and locale
 * Handles both standard routes and internationalized landing pages
 */
export function getSEOMetadata(pathname: string, locale: Locale): SEOMetadata {
  // First, check if this is an internationalized path (landing pages or Polish routes)
  const canonicalKey = REVERSE_PATH_MAP[pathname];
  if (canonicalKey) {
    // Check if this is a standard route (like 'shop_route') that maps to ROUTES
    const routeConstant = ROUTE_KEY_TO_CONSTANT[canonicalKey];
    if (routeConstant) {
      return SEO_DATA[routeConstant][locale];
    }
    // Otherwise it's a landing page, get directly from SEO_DATA
    return SEO_DATA[canonicalKey][locale];
  }

  // Then check standard routes directly
  const routeData = SEO_DATA[pathname as RouteValue];
  if (routeData) {
    return routeData[locale];
  }

  // Fallback to home page SEO
  return SEO_DATA[ROUTES.HOME][locale];
}

/**
 * Generate full URL with locale
 * Handles internationalized paths for landing pages
 */
export function getFullUrl(pathname: string, locale: Locale): string {
  const baseUrl = `https://${SITE_CONFIG.domain}`;

  // Check if this is an internationalized path - need to translate it
  const canonicalKey = REVERSE_PATH_MAP[pathname];
  if (canonicalKey) {
    // Use the localized path from PATH_MAPPINGS
    const localizedPath = PATH_MAPPINGS[canonicalKey][locale];
    if (locale === SITE_CONFIG.defaultLocale) {
      return `${baseUrl}${localizedPath}`;
    }
    return `${baseUrl}/en${localizedPath}`;
  }

  // Standard routes - just add locale prefix if needed
  if (locale === SITE_CONFIG.defaultLocale) {
    return `${baseUrl}${pathname}`;
  }
  return `${baseUrl}/${locale}${pathname}`;
}

/**
 * Get canonical URL (always default locale)
 */
export function getCanonicalUrl(pathname: string): string {
  return `https://${SITE_CONFIG.domain}${pathname}`;
}

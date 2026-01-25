/**
 * SEO Configuration
 * Centralized SEO metadata for all routes and languages
 */

import type { RouteValue } from './routes';
import { ROUTES } from './routes';

export const SITE_CONFIG = {
	name: 'Fold Club',
	domain: 'foldclub.pl',
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
 * SEO metadata for each route in both languages
 */
export const SEO_DATA: Record<RouteValue, LocalizedSEO> = {
	[ROUTES.HOME]: {
		pl: {
			title: 'Papercraft Low Poly - Geometryczne Maski Zwierząt | Fold Club',
			description:
				'Zestawy papercraft do składania geometrycznych masek zwierząt. Low poly DIY - kot, lis, dinozaur, sfinks. Ozdoby ścienne 3D i maski karnawałowe.',
			keywords:
				'papercraft, low poly, maski zwierząt, geometryczne maski, diy z papieru, ozdoby ścienne 3d, maski karnawałowe',
			ogImage: '/og-image-pl.png'
		},
		en: {
			title: 'Low Poly Papercraft - Geometric Animal Masks | Fold Club',
			description:
				'DIY papercraft kits for geometric animal masks. Low poly paper art - cat, fox, dinosaur, sphinx. 3D wall decor and costume masks.',
			keywords:
				'papercraft, low poly, animal masks, geometric masks, diy paper craft, 3d wall art, costume masks',
			ogImage: '/og-image-en.png'
		}
	},
	[ROUTES.SHOP]: {
		pl: {
			title: 'Sklep - Zestawy Papercraft | Fold Club',
			description:
				'Odkryj nasze zestawy papercraft - wycięte i gotowe do składania. Low poly maski, dekoracje ścienne 3D i więcej.',
			keywords: 'sklep papercraft, zestawy diy, maski low poly, dekoracje 3d'
		},
		en: {
			title: 'Shop - Papercraft Kits | Fold Club',
			description:
				'Discover our papercraft kits - pre-cut and ready to fold. Low poly masks, 3D wall decorations and more.',
			keywords: 'papercraft shop, diy kits, low poly masks, 3d decorations'
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
			description:
				'Znajdź odpowiedzi na pytania o nasze zestawy papercraft, wysyłkę i składanie.',
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
	}
};

/**
 * Get SEO metadata for a route and locale
 */
export function getSEOMetadata(pathname: string, locale: Locale): SEOMetadata {
	const routeData = SEO_DATA[pathname as RouteValue];
	if (!routeData) {
		// Fallback to home page SEO
		return SEO_DATA[ROUTES.HOME][locale];
	}
	return routeData[locale];
}

/**
 * Generate full URL with locale
 */
export function getFullUrl(pathname: string, locale: Locale): string {
	const baseUrl = `https://${SITE_CONFIG.domain}`;
	// Default locale (pl) has no prefix, other locales get /locale prefix
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

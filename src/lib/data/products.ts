import { m } from '$lib/paraglide/messages';

export type Product = {
  id: number;
  name: () => string;
  description: () => string;
  price: number;
  difficulty: () => string;
  time: () => string;
  tag: () => string;
  tagColor: 'coral' | 'mint' | 'gold' | 'violet';
  category: 'couples' | 'kids' | 'statement';
  seoKey: 'moai' | 'dino' | 'swans' | 'sphinx';
  slugPL: string;
  slugEN: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: () => m.product_name_swans(),
    description: () => m.product_desc_swans(),
    price: 69,
    difficulty: () => m.product_difficulty_medium(),
    time: () => m.product_time_2_3(),
    tag: () => m.product_tag_date_night(),
    tagColor: 'coral',
    category: 'couples',
    seoKey: 'swans',
    slugPL: 'labedzie-milosci',
    slugEN: 'love-swans'
  },
  {
    id: 2,
    name: () => m.product_name_moai(),
    description: () => m.product_desc_moai(),
    price: 59,
    difficulty: () => m.product_difficulty_medium(),
    time: () => m.product_time_2_3(),
    tag: () => m.product_tag_iconic(),
    tagColor: 'mint',
    category: 'statement',
    seoKey: 'moai',
    slugPL: 'moai-glowa',
    slugEN: 'moai-head'
  },
  {
    id: 3,
    name: () => m.product_name_dino(),
    description: () => m.product_desc_dino(),
    price: 39,
    difficulty: () => m.product_difficulty_easy(),
    time: () => m.product_time_1_2(),
    tag: () => m.product_tag_kids(),
    tagColor: 'gold',
    category: 'kids',
    seoKey: 'dino',
    slugPL: 'baby-dinozaur',
    slugEN: 'baby-dinosaur'
  },
  {
    id: 4,
    name: () => m.product_name_sphinx(),
    description: () => m.product_desc_sphinx(),
    price: 79,
    difficulty: () => m.product_difficulty_hard(),
    time: () => m.product_time_3_4(),
    tag: () => m.product_tag_mystical(),
    tagColor: 'violet',
    category: 'statement',
    seoKey: 'sphinx',
    slugPL: 'sfinks-kot',
    slugEN: 'sphinx-cat'
  }
];

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0
  }).format(value);

export function getProductById(id: number): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === 'all') return products;
  return products.filter((p) => p.category === category);
}

export function getProductBySlug(slug: string, locale: 'pl' | 'en' = 'pl'): Product | undefined {
  const slugField = locale === 'pl' ? 'slugPL' : 'slugEN';
  return products.find((p) => p[slugField] === slug);
}

export function getProductBySlugFallback(slug: string): Product | undefined {
  return products.find((p) => p.slugPL === slug) || products.find((p) => p.slugEN === slug);
}

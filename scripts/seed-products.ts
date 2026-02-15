import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { products, productTranslations } from '../src/lib/server/db/schema';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(DATABASE_URL, { prepare: false });
const db = drizzle(client);

const SEED_DATA = [
  {
    slug: 'love-swans',
    stripeProductId: 'prod_TzAgfDrYSDEvpt',
    stripePriceId: 'price_1T1CL7Bx5nVWL273FQHxcyzM',
    priceAmount: 9900,           // 99 PLN in grosze
    difficulty: 'medium' as const,
    timeEstimate: '2-3' as const,
    tagColor: 'coral' as const,
    category: 'couples' as const,
    translations: {
      en: { slug: 'love-swans',       name: 'LOVE SWANS',          description: 'Two geometric swans that form a heart. Build together, display forever.',                                                                                        tag: 'DATE NIGHT' },
      pl: { slug: 'labedzie-milosci', name: 'ZAKOCHANE ŁABĘDZIE',  description: 'Złóżcie razem te piękne łabędzie i stwórzcie dekorację, która przypomni Wam wspólnie spędzony czas. Idealne na romantyczną randkę.',                           tag: 'RANDKA' },
    },
  },
  {
    slug: 'moai-head',
    stripeProductId: 'prod_TzAjVXn6nGXVmI',
    stripePriceId: 'price_1T1CNfBx5nVWL273DO6aBsGU',
    priceAmount: 8900,           // 89 PLN
    difficulty: 'medium' as const,
    timeEstimate: '2-3' as const,
    tagColor: 'mint' as const,
    category: 'statement' as const,
    translations: {
      en: { slug: 'moai-head',  name: 'MOAI HEAD',    description: 'The iconic Easter Island statue. For a real Sigma. 🗿',                    tag: 'ICONIC' },
      pl: { slug: 'moai-glowa', name: 'GŁOWA MOAI',   description: 'Kultowy posąg z Wyspy Wielkanocnej. Idealne dla prawdziwej sigmy. 🗿',     tag: 'KULTOWY' },
    },
  },
  {
    slug: 'baby-dinosaur',
    stripeProductId: 'prod_TzAiajtSiobY4K',
    stripePriceId: 'price_1T1CMrBx5nVWL273eWoKJPWf',
    priceAmount: 4900,           // 49 PLN
    difficulty: 'easy' as const,
    timeEstimate: '1-2' as const,
    tagColor: 'gold' as const,
    category: 'kids' as const,
    translations: {
      en: { slug: 'baby-dinosaur',  name: 'BABY DINO',   description: "Cute T-Rex with big eyes. RAWR means 'I made this myself'.",   tag: 'KIDS FAVORITE' },
      pl: { slug: 'baby-dinozaur',  name: 'MAŁY DINO',   description: "Słodki T-Rex z dużymi oczami. RAWR znaczy 'zrobiłem to sam'.", tag: 'HIT DZIECIAKÓW' },
    },
  },
  {
    slug: 'sphinx-cat',
    stripeProductId: 'prod_TzAjbjDwAhR3SL',
    stripePriceId: 'price_1T1CNvBx5nVWL273Igtsf2BQ',
    priceAmount: 11900,          // 119 PLN
    difficulty: 'hard' as const,
    timeEstimate: '3-4' as const,
    tagColor: 'violet' as const,
    category: 'statement' as const,
    translations: {
      en: { slug: 'sphinx-cat', name: 'SPHINX CAT', description: 'Ancient Egyptian guardian in geometric form. Mysterious, elegant, timeless.', tag: 'MYSTICAL' },
      pl: { slug: 'sfinks-kot', name: 'KOT SFINKS',  description: 'Starożytny egipski strażnik w geometrycznej formie. Tajemniczy i elegancki.', tag: 'MISTYCZNY' },
    },
  },
];

async function seed() {
  console.log('Clearing existing product data...');
  await db.delete(productTranslations);
  await db.delete(products);

  console.log('Seeding products...\n');

  for (const data of SEED_DATA) {
    const [product] = await db
      .insert(products)
      .values({
        slug:            data.slug,
        stripeProductId: data.stripeProductId,
        stripePriceId:   data.stripePriceId,
        priceAmount:     data.priceAmount,
        difficulty:      data.difficulty,
        timeEstimate:    data.timeEstimate,
        tagColor:        data.tagColor,
        category:        data.category,
      })
      .returning();

    console.log(`✓ ${data.slug} (${product.id})`);

    await db.insert(productTranslations).values([
      { productId: product.id, locale: 'en', ...data.translations.en },
      { productId: product.id, locale: 'pl', ...data.translations.pl },
    ]);

    console.log(`  ✓ en: ${data.translations.en.slug}`);
    console.log(`  ✓ pl: ${data.translations.pl.slug}`);
  }

  console.log('\n✅ Seeding complete!');
  await client.end();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

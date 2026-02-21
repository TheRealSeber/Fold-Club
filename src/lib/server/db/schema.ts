import {
  pgTable,
  pgEnum,
  text,
  integer,
  smallint,
  boolean,
  timestamp,
  uuid,
  uniqueIndex,
  index,
  check,
  jsonb,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'paid',
  'failed',
  'refunded',
]);

export const localeEnum = pgEnum('locale', ['en', 'pl']);

export const difficultyEnum = pgEnum('difficulty', ['easy', 'medium', 'hard']);

export const timeEstimateEnum = pgEnum('time_estimate', ['1-2', '2-3', '3-4']);

export const tagColorEnum = pgEnum('tag_color', ['coral', 'mint', 'gold', 'violet']);

export const categoryEnum = pgEnum('category', ['couples', 'kids', 'statement']);

// ─── Auth ────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
  },
  (table) => [
    index('prt_user_id_idx').on(table.userId),
    index('prt_token_hash_idx').on(table.tokenHash),
  ]
);

// ─── Catalog ─────────────────────────────────────────────────────────────────

export const products = pgTable('products', {
  id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
  slug: text('slug').notNull().unique(),             // canonical EN slug, used as fallback
  stripeProductId: text('stripe_product_id').notNull().unique(),
  stripePriceId: text('stripe_price_id').notNull().unique(),
  priceAmount: integer('price_amount').notNull(),    // in grosze (PLN minor units); 9900 = 99 PLN
  difficulty: difficultyEnum('difficulty').notNull(),
  timeEstimate: timeEstimateEnum('time_estimate').notNull(),
  tagColor: tagColorEnum('tag_color').notNull(),
  category: categoryEnum('category').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const productImages = pgTable(
  'product_images',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    imageKey: text('image_key').notNull(),
    displayOrder: smallint('display_order').notNull(),
  },
  (table) => [
    uniqueIndex('pi_product_display_order_idx').on(table.productId, table.displayOrder),
  ]
);

export const productTranslations = pgTable(
  'product_translations',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    locale: localeEnum('locale').notNull(),
    slug: text('slug').notNull(),                   // locale-specific slug
    name: text('name').notNull(),
    description: text('description').notNull(),
    tag: text('tag').notNull(),                     // localized tag label (e.g. "DATE NIGHT" / "RANDKA")
  },
  (table) => [
    uniqueIndex('pt_product_locale_idx').on(table.productId, table.locale),
    uniqueIndex('pt_locale_slug_idx').on(table.locale, table.slug), // no duplicate slugs per locale
  ]
);

// ─── Orders ──────────────────────────────────────────────────────────────────

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    customerEmail: text('customer_email').notNull(),
    stripeSessionId: text('stripe_session_id').notNull().unique(),
    paymentStatus: paymentStatusEnum('payment_status').notNull().default('pending'),
    amountTotal: integer('amount_total').notNull(),
    currency: text('currency').notNull().default('PLN'),
    trackingSessionId: uuid('tracking_session_id').references(() => trackingSessions.id, { onDelete: 'set null' }),
    fbclid: text('fbclid'),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    eventId: text('event_id'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    index('o_user_id_idx').on(table.userId),
    check('o_amount_total_positive', sql`${table.amountTotal} > 0`),
  ]
);

export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),
    stripePriceId: text('stripe_price_id').notNull(),
    quantity: integer('quantity').notNull().default(1),
    unitAmount: integer('unit_amount').notNull(),
  },
  (table) => [
    index('oi_order_id_idx').on(table.orderId),
    index('oi_product_id_idx').on(table.productId),
    check('oi_quantity_positive', sql`${table.quantity} > 0`),
    check('oi_unit_amount_positive', sql`${table.unitAmount} > 0`),
  ]
);

// ─── Tracking ───────────────────────────────────────────────────────────────

export const trackingSessions = pgTable(
  'tracking_sessions',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    sessionId: text('session_id').notNull().unique(),
    fbclid: text('fbclid'),
    fbc: text('fbc'),
    fbp: text('fbp'),
    gclid: text('gclid'),
    ttclid: text('ttclid'),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    utmContent: text('utm_content'),
    utmTerm: text('utm_term'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    landingPage: text('landing_page'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (table) => [
    index('ts_session_id_idx').on(table.sessionId),
    index('ts_expires_at_idx').on(table.expiresAt),
  ]
);

export const consentRecords = pgTable(
  'consent_records',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    sessionId: text('session_id')
      .notNull()
      .references(() => trackingSessions.sessionId, { onDelete: 'cascade' }),
    necessary: boolean('necessary').notNull().default(true),
    analytics: boolean('analytics').notNull().default(false),
    marketing: boolean('marketing').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('cr_session_id_idx').on(table.sessionId),
  ]
);

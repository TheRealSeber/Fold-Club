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
    // Raw token is sent in the email URL. We store sha256(token) here so a DB
    // leak doesn't hand an attacker usable reset links.
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    // null = still valid. Set to now() on redemption. Single-use enforced in
    // application code by checking this column before accepting a token.
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
  slug: text('slug').notNull().unique(),
  stripeProductId: text('stripe_product_id').notNull().unique(),
  stripePriceId: text('stripe_price_id').notNull().unique(),
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
    // Cloudflare R2 object key. Full URL (with optional CF Image Resizing
    // params) is constructed at render time — never store transformed URLs.
    imageKey: text('image_key').notNull(),
    // 0 = first image shown / thumbnail. Application code treats the lowest
    // displayOrder row as the product thumbnail — no separate column needed.
    displayOrder: smallint('display_order').notNull(),
  },
  (table) => [
    // Composite unique; also serves as an index on productId alone (leftmost
    // prefix rule), so no separate single-column index is needed.
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
    name: text('name').notNull(),
    description: text('description').notNull(),
  },
  (table) => [
    // Composite unique; also covers queries filtering on productId alone.
    uniqueIndex('pt_product_locale_idx').on(table.productId, table.locale),
  ]
);

// ─── Orders ──────────────────────────────────────────────────────────────────

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    // Nullable: guest checkout leaves this null. Can be backfilled later by
    // matching customerEmail when the guest creates an account.
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    // Always stored — even for logged-in users. If a user later changes their
    // email, historical orders still have the correct contact address.
    customerEmail: text('customer_email').notNull(),
    stripeSessionId: text('stripe_session_id').notNull().unique(),
    paymentStatus: paymentStatusEnum('payment_status').notNull().default('pending'),
    // Minor units (grosze for PLN). Snapshot of the total charged — do not
    // derive from order_items at query time.
    amountTotal: integer('amount_total').notNull(),
    currency: text('currency').notNull().default('PLN'),
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
    // RESTRICT: prevents deleting a product that appears in any order.
    // To retire a product, set products.is_active = false.
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),
    // Snapshots — prices change over time. These fields record exactly what
    // was charged, independent of the current product price.
    stripePriceId: text('stripe_price_id').notNull(),
    quantity: integer('quantity').notNull().default(1),
    unitAmount: integer('unit_amount').notNull(), // minor units
  },
  (table) => [
    index('oi_order_id_idx').on(table.orderId),
    index('oi_product_id_idx').on(table.productId),
    check('oi_quantity_positive', sql`${table.quantity} > 0`),
    check('oi_unit_amount_positive', sql`${table.unitAmount} > 0`),
  ]
);

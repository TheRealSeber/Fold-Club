-- Add tracking_sessions table
CREATE TABLE IF NOT EXISTS "tracking_sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL UNIQUE,
	"fbclid" text,
	"fbc" text,
	"fbp" text,
	"gclid" text,
	"ttclid" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_content" text,
	"utm_term" text,
	"ip_address" text,
	"user_agent" text,
	"landing_page" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);

-- Add consent_records table
CREATE TABLE IF NOT EXISTS "consent_records" (
	"id" uuid PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"necessary" boolean DEFAULT true NOT NULL,
	"analytics" boolean DEFAULT false NOT NULL,
	"marketing" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Add tracking columns to orders table
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tracking_session_id" uuid;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "fbclid" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "utm_source" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "utm_medium" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "utm_campaign" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "event_id" text;

-- Add foreign keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'consent_records_session_id_tracking_sessions_session_id_fk'
  ) THEN
    ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_session_id_tracking_sessions_session_id_fk"
      FOREIGN KEY ("session_id") REFERENCES "tracking_sessions"("session_id") ON DELETE cascade;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_tracking_session_id_tracking_sessions_id_fk'
  ) THEN
    ALTER TABLE "orders" ADD CONSTRAINT "orders_tracking_session_id_tracking_sessions_id_fk"
      FOREIGN KEY ("tracking_session_id") REFERENCES "tracking_sessions"("id") ON DELETE set null;
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS "cr_session_id_idx" ON "consent_records" ("session_id");
CREATE INDEX IF NOT EXISTS "ts_session_id_idx" ON "tracking_sessions" ("session_id");
CREATE INDEX IF NOT EXISTS "ts_expires_at_idx" ON "tracking_sessions" ("expires_at");

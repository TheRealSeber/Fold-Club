import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

const DATABASE_URL = env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

// Configure for Supabase compatibility
const client = postgres(DATABASE_URL, {
  prepare: false, // Required for Supabase connection pooling
  max: 10, // Connection pool size
  idle_timeout: 20, // Close idle connections after 20s
  connect_timeout: 10 // Timeout connection attempts after 10s
});

export const db = drizzle(client, { schema });

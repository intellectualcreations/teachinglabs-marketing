import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const envFiles = [resolve(__dirname, '..', '.env.local'), resolve('/home/sacwoo/.openclaw/workspace/.env')];
for (const f of envFiles) {
  try { for (const l of readFileSync(f, 'utf8').split('\n')) { const m = l.match(/^([^#=]+)=(.*)/); if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim(); } } catch {}
}
const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL.replace('https://','').replace('.supabase.co','');
const client = new pg.Client({ host: `db.${projectRef}.supabase.co`, port: 5432, database: 'postgres', user: 'postgres', password: process.env.SUPABASE_DB_PASSWORD, ssl: { rejectUnauthorized: false } });
await client.connect();

// Add is_open column (default true)
try {
  await client.query('ALTER TABLE class_activities ADD COLUMN is_open boolean NOT NULL DEFAULT true');
  console.log('Added is_open column');
} catch (e) { console.log('is_open:', e.message); }

// Add due_date column
try {
  await client.query('ALTER TABLE class_activities ADD COLUMN due_date timestamptz');
  console.log('Added due_date column');
} catch (e) { console.log('due_date:', e.message); }

await client.end();

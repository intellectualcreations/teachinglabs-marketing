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

await client.query(`
  CREATE TABLE IF NOT EXISTS activity_chats (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_id uuid NOT NULL,
    student_id uuid NOT NULL,
    role text NOT NULL CHECK (role IN ('user', 'assistant')),
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
  )
`);
console.log('Created activity_chats table');

// Add index for fast lookups
await client.query(`
  CREATE INDEX IF NOT EXISTS idx_activity_chats_lookup 
  ON activity_chats (activity_id, student_id, created_at)
`);
console.log('Added index');

await client.end();

import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env vars
const envFiles = [
  resolve(__dirname, '..', '.env.local'),
  resolve('/home/sacwoo/.openclaw/workspace/.env'),
];
for (const f of envFiles) {
  try {
    const lines = readFileSync(f, 'utf8').split('\n');
    for (const line of lines) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
    }
  } catch {}
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

const client = new pg.Client({
  host: `db.${projectRef}.supabase.co`,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: dbPassword,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log('Connected to database');

const sql = `
CREATE TABLE IF NOT EXISTS class_activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(class_id, activity_id)
);

CREATE INDEX IF NOT EXISTS idx_class_activities_class ON class_activities(class_id);
CREATE INDEX IF NOT EXISTS idx_class_activities_activity ON class_activities(activity_id);

ALTER TABLE class_activities ENABLE ROW LEVEL SECURITY;
`;

await client.query(sql);
console.log('class_activities table created successfully!');

// Verify
const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'class_activities' ORDER BY ordinal_position");
console.log('\nColumns:');
for (const row of res.rows) {
  console.log(`  ${row.column_name}: ${row.data_type}`);
}

await client.end();

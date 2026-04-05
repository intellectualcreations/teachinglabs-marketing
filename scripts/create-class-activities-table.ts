/**
 * Create the class_activities junction table via Supabase SQL.
 * Usage: npx tsx scripts/create-class-activities-table.ts
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local
const envLocal = resolve(__dirname, '..', '.env.local');
try {
  const lines = readFileSync(envLocal, 'utf8').split('\n');
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim();
    }
  }
} catch {}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  db: { schema: 'public' },
});

async function main() {
  // Use supabase.rpc to execute raw SQL via a custom function
  // But we don't have one. Instead let's try creating via REST insert patterns.
  // Actually, the best approach is to use the Supabase SQL API endpoint.
  
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
  `;

  // Use the management API
  const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
  
  // Try using the pg endpoint
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  if (res.ok) {
    console.log('Table created successfully!');
    return;
  }

  // If exec_sql doesn't exist, we need to create it first or use another approach
  console.log('exec_sql not available, trying alternative...');
  
  // Create the exec_sql function first
  // This won't work via REST either... Let's try the Supabase dashboard SQL approach
  // via the management API
  
  console.log('\nPlease run this SQL in the Supabase dashboard SQL editor:');
  console.log('Project URL:', SUPABASE_URL);
  console.log('\n---SQL---');
  console.log(sql);
  console.log('---END---');
  
  // Alternative: Check if we can use the pg_net extension or http endpoint
  // Actually, let's try creating via individual insert operations
  // No - we need DDL. Let me check if there's a database connection string available.
  
  console.log('\nAttempting via supabase-js...');
  const { error } = await supabase.from('class_activities').select('id').limit(0);
  if (!error) {
    console.log('Table already exists!');
  } else if (error.code === '42P01') {
    console.log('Table does not exist. Need SQL access to create it.');
    console.log('Run the SQL above in: https://supabase.com/dashboard/project/' + projectRef + '/sql');
  } else {
    console.log('Error:', error.message);
  }
}

main();

/**
 * Import ELSI district data from Dottie's spreadsheet into Supabase schools table.
 * Run: npx tsx /tmp/import-elsi.ts
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import { resolve } from "path";

dotenv.config({ path: resolve(process.env.HOME!, ".openclaw/workspace/projects/teachinglabs-app/dev/.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // Read TSV
  const raw = fs.readFileSync("/tmp/elsi-export.tsv", "utf-8");
  const lines = raw.split("\n").filter(l => l.trim());
  const headers = lines[0].split("\t");
  console.log(`Headers: ${headers.length} columns, ${lines.length - 1} data rows`);

  // Parse rows
  const rows: { name: string; district: string; state: string; city: string; zip: string; address?: string; nces_id: string }[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split("\t");
    if (cols.length < 13) continue;
    
    const name = cols[0]?.trim();
    const state = (cols[3] || cols[11] || "").trim();
    const district = (cols[4]?.trim()) || name;
    const city = cols[10]?.trim() || "";
    const zip = cols[12]?.trim() || "";
    const address = cols[9]?.trim() || "";
    
    if (!name || !state || state.length < 2) continue;
    
    const cleanState = state.substring(0, 2);
    const nces_id = `ELSI_${cleanState}_${i.toString().padStart(5, "0")}`;
    
    rows.push({
      name: name.substring(0, 255),
      district: district.substring(0, 255),
      state: cleanState,
      city: city.substring(0, 100),
      zip: zip.substring(0, 10),
      ...(address ? { address: address.substring(0, 255) } : {}),
      nces_id,
    });
  }
  
  console.log(`Parsed ${rows.length} districts`);
  
  // First delete old SEED_ entries (replaced by real data)
  const { error: delErr } = await supabase.from("schools").delete().like("nces_id", "SEED_%");
  if (delErr) console.log(`Delete SEED_ warning: ${delErr.message}`);
  else console.log("Cleaned old SEED_* entries");

  // Upsert in batches of 500
  const BATCH = 500;
  let success = 0;
  let errors = 0;
  
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { data, error } = await supabase
      .from("schools")
      .upsert(batch, { onConflict: "nces_id" })
      .select("id");
    
    if (error) {
      console.error(`  Batch ${Math.floor(i/BATCH)+1} error: ${error.message}`);
      errors += batch.length;
    } else {
      success += data?.length || batch.length;
    }
    
    if ((i / BATCH) % 5 === 0 || i + BATCH >= rows.length) {
      console.log(`  Progress: ${Math.min(i + BATCH, rows.length)}/${rows.length} (${success} ok, ${errors} err)`);
    }
  }
  
  // Final count
  const { count } = await supabase.from("schools").select("*", { count: "exact", head: true });
  console.log(`\nDone! ${success} imported, ${errors} errors. Total schools in DB: ${count}`);
  
  // Count by state
  const { data: stateData } = await supabase.from("schools").select("state");
  const states = [...new Set((stateData as { state: string }[]).map(s => s.state))].sort();
  console.log(`States covered: ${states.length} — ${states.join(", ")}`);
}

main();

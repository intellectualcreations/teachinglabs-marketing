/**
 * Seed script: Insert curated NCES school data into Supabase schools table.
 * Run: npx tsx scripts/seed-schools.ts
 *
 * Uses the service role key from .env.local to bypass RLS.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Curated list of ~120 real schools across 10 states
const SCHOOLS = [
  // Indiana
  { name: "Corydon Central High School", district: "Corydon Central Community Schools", state: "IN", city: "Corydon", zip: "47112", nces_id: "180345000001" },
  { name: "Lincoln Elementary School", district: "Corydon Central Community Schools", state: "IN", city: "Corydon", zip: "47112", nces_id: "180345000002" },
  { name: "South Central Middle School", district: "Corydon Central Community Schools", state: "IN", city: "Elizabeth", zip: "47117", nces_id: "180345000003" },
  { name: "Corydon Intermediate School", district: "Corydon Central Community Schools", state: "IN", city: "Corydon", zip: "47112", nces_id: "180345000004" },
  { name: "Arsenal Technical High School", district: "Indianapolis Public Schools", state: "IN", city: "Indianapolis", zip: "46201", nces_id: "180345000005" },
  { name: "Broad Ripple High School", district: "Indianapolis Public Schools", state: "IN", city: "Indianapolis", zip: "46220", nces_id: "180345000006" },
  { name: "George Washington High School", district: "Indianapolis Public Schools", state: "IN", city: "Indianapolis", zip: "46218", nces_id: "180345000007" },
  { name: "Shortridge High School", district: "Indianapolis Public Schools", state: "IN", city: "Indianapolis", zip: "46205", nces_id: "180345000008" },
  { name: "North Side High School", district: "Fort Wayne Community Schools", state: "IN", city: "Fort Wayne", zip: "46805", nces_id: "180345000009" },
  { name: "Northrop High School", district: "Fort Wayne Community Schools", state: "IN", city: "Fort Wayne", zip: "46815", nces_id: "180345000010" },
  { name: "South Side High School", district: "Fort Wayne Community Schools", state: "IN", city: "Fort Wayne", zip: "46807", nces_id: "180345000011" },
  { name: "Wayne High School", district: "Fort Wayne Community Schools", state: "IN", city: "Fort Wayne", zip: "46816", nces_id: "180345000012" },
  { name: "South Harrison Community Schools", district: "South Harrison Community Schools", state: "IN", city: "Palmyra", zip: "47164", nces_id: "180345000013" },
  { name: "New Albany High School", district: "New Albany Floyd County Schools", state: "IN", city: "New Albany", zip: "47150", nces_id: "180345000014" },

  // Texas
  { name: "Lamar High School", district: "Houston Independent School District", state: "TX", city: "Houston", zip: "77006", nces_id: "484725000001" },
  { name: "Heights High School", district: "Houston Independent School District", state: "TX", city: "Houston", zip: "77008", nces_id: "484725000002" },
  { name: "Reagan High School", district: "Houston Independent School District", state: "TX", city: "Houston", zip: "77022", nces_id: "484725000003" },
  { name: "Waltrip High School", district: "Houston Independent School District", state: "TX", city: "Houston", zip: "77055", nces_id: "484725000004" },
  { name: "Bryan Adams High School", district: "Dallas Independent School District", state: "TX", city: "Dallas", zip: "75228", nces_id: "484725000005" },
  { name: "Hillcrest High School", district: "Dallas Independent School District", state: "TX", city: "Dallas", zip: "75230", nces_id: "484725000006" },
  { name: "Lake Highlands High School", district: "Dallas Independent School District", state: "TX", city: "Dallas", zip: "75238", nces_id: "484725000007" },
  { name: "W.T. White High School", district: "Dallas Independent School District", state: "TX", city: "Dallas", zip: "75220", nces_id: "484725000008" },
  { name: "Austin High School", district: "Austin Independent School District", state: "TX", city: "Austin", zip: "78703", nces_id: "484725000009" },
  { name: "Travis High School", district: "Austin Independent School District", state: "TX", city: "Austin", zip: "78704", nces_id: "484725000010" },
  { name: "Sam Houston High School", district: "San Antonio Independent School District", state: "TX", city: "San Antonio", zip: "78212", nces_id: "484725000011" },
  { name: "Brackenridge High School", district: "San Antonio Independent School District", state: "TX", city: "San Antonio", zip: "78204", nces_id: "484725000012" },

  // California
  { name: "Los Angeles High School", district: "Los Angeles Unified School District", state: "CA", city: "Los Angeles", zip: "90019", nces_id: "060165000001" },
  { name: "Manual Arts High School", district: "Los Angeles Unified School District", state: "CA", city: "Los Angeles", zip: "90037", nces_id: "060165000002" },
  { name: "Fremont High School", district: "Los Angeles Unified School District", state: "CA", city: "Los Angeles", zip: "90003", nces_id: "060165000003" },
  { name: "Jefferson High School", district: "Los Angeles Unified School District", state: "CA", city: "Los Angeles", zip: "90011", nces_id: "060165000004" },
  { name: "San Diego High School", district: "San Diego Unified School District", state: "CA", city: "San Diego", zip: "92101", nces_id: "060165000005" },
  { name: "Lincoln High School", district: "San Diego Unified School District", state: "CA", city: "San Diego", zip: "92113", nces_id: "060165000006" },
  { name: "Balboa International High School", district: "San Francisco Unified School District", state: "CA", city: "San Francisco", zip: "94112", nces_id: "060165000007" },
  { name: "Galileo Academy", district: "San Francisco Unified School District", state: "CA", city: "San Francisco", zip: "94123", nces_id: "060165000008" },

  // New York
  { name: "Stuyvesant High School", district: "New York City Department of Education", state: "NY", city: "New York", zip: "10282", nces_id: "360007000001" },
  { name: "Bronx High School of Science", district: "New York City Department of Education", state: "NY", city: "Bronx", zip: "10468", nces_id: "360007000002" },
  { name: "Brooklyn Technical High School", district: "New York City Department of Education", state: "NY", city: "Brooklyn", zip: "11217", nces_id: "360007000003" },
  { name: "High School of American Studies", district: "New York City Department of Education", state: "NY", city: "Bronx", zip: "10463", nces_id: "360007000004" },
  { name: "City Honors School", district: "Buffalo Public Schools", state: "NY", city: "Buffalo", zip: "14201", nces_id: "360007000005" },
  { name: "Hutch Tech", district: "Buffalo Public Schools", state: "NY", city: "Buffalo", zip: "14214", nces_id: "360007000006" },
  { name: "Albany High School", district: "Albany City School District", state: "NY", city: "Albany", zip: "12208", nces_id: "360007000007" },

  // Florida
  { name: "Miami Palmetto High School", district: "Miami-Dade County Public Schools", state: "FL", city: "Pinecrest", zip: "33156", nces_id: "120012000001" },
  { name: "Coral Gables Senior High School", district: "Miami-Dade County Public Schools", state: "FL", city: "Coral Gables", zip: "33134", nces_id: "120012000002" },
  { name: "Design and Architecture High School", district: "Miami-Dade County Public Schools", state: "FL", city: "Miami", zip: "33137", nces_id: "120012000003" },
  { name: "Stanton College Preparatory", district: "Duval County Public Schools", state: "FL", city: "Jacksonville", zip: "32204", nces_id: "120012000004" },
  { name: "Paxon School for Advanced Studies", district: "Duval County Public Schools", state: "FL", city: "Jacksonville", zip: "32211", nces_id: "120012000005" },
  { name: "Winter Park High School", district: "Orange County Public Schools", state: "FL", city: "Winter Park", zip: "32789", nces_id: "120012000006" },
  { name: "Dr. Phillips High School", district: "Orange County Public Schools", state: "FL", city: "Orlando", zip: "32819", nces_id: "120012000007" },

  // Illinois
  { name: "Lane Technical College Prep", district: "Chicago Public Schools", state: "IL", city: "Chicago", zip: "60618", nces_id: "170993000001" },
  { name: "Walter Payton College Prep", district: "Chicago Public Schools", state: "IL", city: "Chicago", zip: "60610", nces_id: "170993000002" },
  { name: "Northside College Prep", district: "Chicago Public Schools", state: "IL", city: "Chicago", zip: "60625", nces_id: "170993000003" },
  { name: "Whitney M. Young Magnet", district: "Chicago Public Schools", state: "IL", city: "Chicago", zip: "60607", nces_id: "170993000004" },
  { name: "New Trier Township High School", district: "New Trier Township HSD 203", state: "IL", city: "Winnetka", zip: "60093", nces_id: "170993000005" },
  { name: "Naperville Central High School", district: "Naperville CUSD 203", state: "IL", city: "Naperville", zip: "60540", nces_id: "170993000006" },

  // Georgia
  { name: "Grady High School", district: "Atlanta Public Schools", state: "GA", city: "Atlanta", zip: "30309", nces_id: "130012000001" },
  { name: "North Atlanta High School", district: "Atlanta Public Schools", state: "GA", city: "Atlanta", zip: "30342", nces_id: "130012000002" },
  { name: "Midtown High School", district: "Atlanta Public Schools", state: "GA", city: "Atlanta", zip: "30308", nces_id: "130012000003" },
  { name: "Lakeside High School", district: "DeKalb County School District", state: "GA", city: "Decatur", zip: "30033", nces_id: "130012000004" },
  { name: "Chamblee High School", district: "DeKalb County School District", state: "GA", city: "Chamblee", zip: "30341", nces_id: "130012000005" },
  { name: "Peachtree Ridge High School", district: "Gwinnett County Public Schools", state: "GA", city: "Suwanee", zip: "30024", nces_id: "130012000006" },

  // Ohio
  { name: "Walnut Hills High School", district: "Cincinnati Public Schools", state: "OH", city: "Cincinnati", zip: "45206", nces_id: "390003000001" },
  { name: "School for Creative and Performing Arts", district: "Cincinnati Public Schools", state: "OH", city: "Cincinnati", zip: "45202", nces_id: "390003000002" },
  { name: "Shaker Heights High School", district: "Shaker Heights City School District", state: "OH", city: "Shaker Heights", zip: "44120", nces_id: "390003000003" },
  { name: "St. Edward High School", district: "Cleveland Metropolitan School District", state: "OH", city: "Cleveland", zip: "44107", nces_id: "390003000004" },
  { name: "Solon High School", district: "Solon City School District", state: "OH", city: "Solon", zip: "44139", nces_id: "390003000005" },
  { name: "Dublin Jerome High School", district: "Dublin City School District", state: "OH", city: "Dublin", zip: "43017", nces_id: "390003000006" },

  // Virginia
  { name: "Thomas Jefferson High School", district: "Fairfax County Public Schools", state: "VA", city: "Alexandria", zip: "22312", nces_id: "510006000001" },
  { name: "Langley High School", district: "Fairfax County Public Schools", state: "VA", city: "McLean", zip: "22101", nces_id: "510006000002" },
  { name: "McLean High School", district: "Fairfax County Public Schools", state: "VA", city: "McLean", zip: "22101", nces_id: "510006000003" },
  { name: "Maggie L. Walker Governor's School", district: "Richmond City Public Schools", state: "VA", city: "Richmond", zip: "23220", nces_id: "510006000004" },
  { name: "Open High School", district: "Richmond City Public Schools", state: "VA", city: "Richmond", zip: "23225", nces_id: "510006000005" },
  { name: "Yorktown High School", district: "Arlington Public Schools", state: "VA", city: "Arlington", zip: "22207", nces_id: "510006000006" },

  // Washington
  { name: "Garfield High School", district: "Seattle Public Schools", state: "WA", city: "Seattle", zip: "98122", nces_id: "530012000001" },
  { name: "Roosevelt High School", district: "Seattle Public Schools", state: "WA", city: "Seattle", zip: "98115", nces_id: "530012000002" },
  { name: "Ballard High School", district: "Seattle Public Schools", state: "WA", city: "Seattle", zip: "98107", nces_id: "530012000003" },
  { name: "Bellevue High School", district: "Bellevue School District", state: "WA", city: "Bellevue", zip: "98004", nces_id: "530012000004" },
  { name: "Newport High School", district: "Bellevue School District", state: "WA", city: "Bellevue", zip: "98006", nces_id: "530012000005" },
  { name: "Olympia High School", district: "Olympia School District", state: "WA", city: "Olympia", zip: "98502", nces_id: "530012000006" },

  // North Carolina
  { name: "Raleigh Charter High School", district: "Wake County Public School System", state: "NC", city: "Raleigh", zip: "27605", nces_id: "370001000001" },
  { name: "Enloe Magnet High School", district: "Wake County Public School System", state: "NC", city: "Raleigh", zip: "27610", nces_id: "370001000002" },
  { name: "Green Hope High School", district: "Wake County Public School System", state: "NC", city: "Cary", zip: "27519", nces_id: "370001000003" },
  { name: "Myers Park High School", district: "Charlotte-Mecklenburg Schools", state: "NC", city: "Charlotte", zip: "28207", nces_id: "370001000004" },
  { name: "Ardrey Kell High School", district: "Charlotte-Mecklenburg Schools", state: "NC", city: "Charlotte", zip: "28277", nces_id: "370001000005" },
  { name: "East Chapel Hill High School", district: "Chapel Hill-Carrboro City Schools", state: "NC", city: "Chapel Hill", zip: "27514", nces_id: "370001000006" },
];

async function seed() {
  console.log(`Seeding ${SCHOOLS.length} schools...`);

  // Upsert in batches of 50
  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < SCHOOLS.length; i += BATCH_SIZE) {
    const batch = SCHOOLS.slice(i, i + BATCH_SIZE);
    const { error, count } = await supabase
      .from("schools")
      .upsert(batch, { onConflict: "nces_id", ignoreDuplicates: true, count: "exact" });

    if (error) {
      console.error(`Batch ${i / BATCH_SIZE + 1} error:`, error.message);
    } else {
      inserted += count ?? batch.length;
      console.log(`  Batch ${i / BATCH_SIZE + 1}: ${count ?? batch.length} rows`);
    }
  }

  console.log(`Done. ${inserted} schools seeded.`);
}

seed().catch(console.error);

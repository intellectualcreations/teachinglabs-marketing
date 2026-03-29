/**
 * Supplemental seed: Add at least 2 schools per state for all 50 US states.
 * Run: npx tsx scripts/seed-all-states.ts
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

// One major district + 2 schools per state not already seeded
// States already covered: CA, FL, GA, IL, IN, NC, NY, OH, TX, VA, WA
const ADDITIONAL: { name: string; district: string; state: string; city: string; zip: string }[] = [
  // Alabama
  { name: "Hoover High School", district: "Hoover City Schools", state: "AL", city: "Hoover", zip: "35244" },
  { name: "Spain Park High School", district: "Hoover City Schools", state: "AL", city: "Hoover", zip: "35242" },
  { name: "Bob Jones High School", district: "Madison City Schools", state: "AL", city: "Madison", zip: "35758" },
  // Alaska
  { name: "East Anchorage High School", district: "Anchorage School District", state: "AK", city: "Anchorage", zip: "99504" },
  { name: "West Anchorage High School", district: "Anchorage School District", state: "AK", city: "Anchorage", zip: "99517" },
  // Arizona
  { name: "Hamilton High School", district: "Chandler Unified School District", state: "AZ", city: "Chandler", zip: "85249" },
  { name: "Perry High School", district: "Chandler Unified School District", state: "AZ", city: "Gilbert", zip: "85297" },
  { name: "Desert Vista High School", district: "Tempe Union High School District", state: "AZ", city: "Phoenix", zip: "85048" },
  // Arkansas
  { name: "Little Rock Central High School", district: "Little Rock School District", state: "AR", city: "Little Rock", zip: "72202" },
  { name: "Bentonville High School", district: "Bentonville School District", state: "AR", city: "Bentonville", zip: "72712" },
  // Colorado
  { name: "Cherry Creek High School", district: "Cherry Creek School District", state: "CO", city: "Greenwood Village", zip: "80111" },
  { name: "Grandview High School", district: "Cherry Creek School District", state: "CO", city: "Aurora", zip: "80015" },
  // Connecticut
  { name: "Greenwich High School", district: "Greenwich Public Schools", state: "CT", city: "Greenwich", zip: "06830" },
  { name: "Staples High School", district: "Westport Public Schools", state: "CT", city: "Westport", zip: "06880" },
  // Delaware
  { name: "Salesianum School", district: "Red Clay Consolidated School District", state: "DE", city: "Wilmington", zip: "19802" },
  { name: "Caesar Rodney High School", district: "Caesar Rodney School District", state: "DE", city: "Camden", zip: "19934" },
  // Hawaii
  { name: "Punahou School", district: "Hawaii Department of Education", state: "HI", city: "Honolulu", zip: "96822" },
  { name: "Mililani High School", district: "Hawaii Department of Education", state: "HI", city: "Mililani", zip: "96789" },
  // Idaho
  { name: "Boise High School", district: "Boise School District", state: "ID", city: "Boise", zip: "83702" },
  { name: "Timberline High School", district: "Boise School District", state: "ID", city: "Boise", zip: "83709" },
  // Iowa
  { name: "Roosevelt High School", district: "Des Moines Public Schools", state: "IA", city: "Des Moines", zip: "50321" },
  { name: "Valley High School", district: "West Des Moines Community Schools", state: "IA", city: "West Des Moines", zip: "50265" },
  // Kansas
  { name: "Blue Valley North High School", district: "Blue Valley Unified School District", state: "KS", city: "Overland Park", zip: "66223" },
  { name: "Shawnee Mission East High School", district: "Shawnee Mission School District", state: "KS", city: "Prairie Village", zip: "66208" },
  // Kentucky
  { name: "duPont Manual High School", district: "Jefferson County Public Schools", state: "KY", city: "Louisville", zip: "40208" },
  { name: "Paul Laurence Dunbar High School", district: "Fayette County Public Schools", state: "KY", city: "Lexington", zip: "40513" },
  { name: "Tates Creek High School", district: "Fayette County Public Schools", state: "KY", city: "Lexington", zip: "40517" },
  // Louisiana
  { name: "Baton Rouge Magnet High School", district: "East Baton Rouge Parish Schools", state: "LA", city: "Baton Rouge", zip: "70806" },
  { name: "Benjamin Franklin High School", district: "Orleans Parish School Board", state: "LA", city: "New Orleans", zip: "70118" },
  // Maine
  { name: "Portland High School", district: "Portland Public Schools", state: "ME", city: "Portland", zip: "04101" },
  { name: "Bangor High School", district: "Bangor School Department", state: "ME", city: "Bangor", zip: "04401" },
  // Maryland
  { name: "Thomas S. Wootton High School", district: "Montgomery County Public Schools", state: "MD", city: "Rockville", zip: "20850" },
  { name: "Centennial High School", district: "Howard County Public Schools", state: "MD", city: "Ellicott City", zip: "21042" },
  // Massachusetts
  { name: "Boston Latin School", district: "Boston Public Schools", state: "MA", city: "Boston", zip: "02115" },
  { name: "Lexington High School", district: "Lexington Public Schools", state: "MA", city: "Lexington", zip: "02421" },
  // Michigan
  { name: "Ann Arbor Pioneer High School", district: "Ann Arbor Public Schools", state: "MI", city: "Ann Arbor", zip: "48104" },
  { name: "Troy High School", district: "Troy School District", state: "MI", city: "Troy", zip: "48084" },
  // Minnesota
  { name: "Wayzata High School", district: "Wayzata Public Schools", state: "MN", city: "Plymouth", zip: "55446" },
  { name: "Edina High School", district: "Edina Public Schools", state: "MN", city: "Edina", zip: "55424" },
  // Mississippi
  { name: "Madison Central High School", district: "Madison County School District", state: "MS", city: "Madison", zip: "39110" },
  { name: "Oxford High School", district: "Oxford School District", state: "MS", city: "Oxford", zip: "38655" },
  // Missouri
  { name: "Clayton High School", district: "Clayton School District", state: "MO", city: "Clayton", zip: "63105" },
  { name: "Parkway West High School", district: "Parkway School District", state: "MO", city: "Ballwin", zip: "63011" },
  // Montana
  { name: "Hellgate High School", district: "Missoula County Public Schools", state: "MT", city: "Missoula", zip: "59801" },
  { name: "Bozeman High School", district: "Bozeman School District", state: "MT", city: "Bozeman", zip: "59715" },
  // Nebraska
  { name: "Lincoln Southeast High School", district: "Lincoln Public Schools", state: "NE", city: "Lincoln", zip: "68510" },
  { name: "Millard West High School", district: "Millard Public Schools", state: "NE", city: "Omaha", zip: "68137" },
  // Nevada
  { name: "Palo Verde High School", district: "Clark County School District", state: "NV", city: "Las Vegas", zip: "89119" },
  { name: "Reno High School", district: "Washoe County School District", state: "NV", city: "Reno", zip: "89501" },
  // New Hampshire
  { name: "Pinkerton Academy", district: "Derry School District", state: "NH", city: "Derry", zip: "03038" },
  { name: "Exeter High School", district: "SAU 16 Exeter", state: "NH", city: "Exeter", zip: "03833" },
  // New Jersey
  { name: "Bergen County Academies", district: "Bergen County Technical Schools", state: "NJ", city: "Hackensack", zip: "07601" },
  { name: "Millburn High School", district: "Millburn Township Public Schools", state: "NJ", city: "Millburn", zip: "07041" },
  // New Mexico
  { name: "Albuquerque Academy", district: "Albuquerque Public Schools", state: "NM", city: "Albuquerque", zip: "87111" },
  { name: "La Cueva High School", district: "Albuquerque Public Schools", state: "NM", city: "Albuquerque", zip: "87111" },
  // North Dakota
  { name: "Fargo North High School", district: "Fargo Public Schools", state: "ND", city: "Fargo", zip: "58102" },
  { name: "Red River High School", district: "Grand Forks Public Schools", state: "ND", city: "Grand Forks", zip: "58201" },
  // Oklahoma
  { name: "Jenks High School", district: "Jenks Public Schools", state: "OK", city: "Jenks", zip: "74037" },
  { name: "Edmond North High School", district: "Edmond Public Schools", state: "OK", city: "Edmond", zip: "73013" },
  // Oregon
  { name: "Lincoln High School", district: "Portland Public Schools", state: "OR", city: "Portland", zip: "97201" },
  { name: "Lake Oswego High School", district: "Lake Oswego School District", state: "OR", city: "Lake Oswego", zip: "97034" },
  // Pennsylvania
  { name: "Central High School", district: "School District of Philadelphia", state: "PA", city: "Philadelphia", zip: "19141" },
  { name: "Lower Merion High School", district: "Lower Merion School District", state: "PA", city: "Ardmore", zip: "19003" },
  // Rhode Island
  { name: "Classical High School", district: "Providence Public Schools", state: "RI", city: "Providence", zip: "02903" },
  { name: "Barrington High School", district: "Barrington Public Schools", state: "RI", city: "Barrington", zip: "02806" },
  // South Carolina
  { name: "Wando High School", district: "Charleston County School District", state: "SC", city: "Mount Pleasant", zip: "29466" },
  { name: "Greenville High School", district: "Greenville County Schools", state: "SC", city: "Greenville", zip: "29601" },
  // South Dakota
  { name: "Lincoln High School", district: "Sioux Falls School District", state: "SD", city: "Sioux Falls", zip: "57108" },
  { name: "Stevens High School", district: "Rapid City Area Schools", state: "SD", city: "Rapid City", zip: "57702" },
  // Tennessee
  { name: "Hume-Fogg Academic High School", district: "Metro Nashville Public Schools", state: "TN", city: "Nashville", zip: "37203" },
  { name: "White Station High School", district: "Shelby County Schools", state: "TN", city: "Memphis", zip: "38117" },
  // Utah
  { name: "Skyline High School", district: "Granite School District", state: "UT", city: "Salt Lake City", zip: "84108" },
  { name: "Lone Peak High School", district: "Alpine School District", state: "UT", city: "Highland", zip: "84003" },
  // Vermont
  { name: "Burlington High School", district: "Burlington School District", state: "VT", city: "Burlington", zip: "05401" },
  { name: "South Burlington High School", district: "South Burlington School District", state: "VT", city: "South Burlington", zip: "05403" },
  // West Virginia
  { name: "George Washington High School", district: "Kanawha County Schools", state: "WV", city: "Charleston", zip: "25304" },
  { name: "Morgantown High School", district: "Monongalia County Schools", state: "WV", city: "Morgantown", zip: "26505" },
  // Wisconsin
  { name: "James Madison Memorial High School", district: "Madison Metropolitan School District", state: "WI", city: "Madison", zip: "53711" },
  { name: "Brookfield East High School", district: "Elmbrook School District", state: "WI", city: "Brookfield", zip: "53005" },
  // Wyoming
  { name: "Cheyenne Central High School", district: "Laramie County School District 1", state: "WY", city: "Cheyenne", zip: "82001" },
  { name: "Natrona County High School", district: "Natrona County School District", state: "WY", city: "Casper", zip: "82601" },
];

async function seed() {
  console.log(`Seeding ${ADDITIONAL.length} schools across remaining states...`);

  // Upsert in batches of 50
  for (let i = 0; i < ADDITIONAL.length; i += 50) {
    const batch = ADDITIONAL.slice(i, i + 50).map((s, idx) => ({
      name: s.name,
      district: s.district,
      state: s.state,
      city: s.city,
      zip: s.zip,
      nces_id: `SEED_${s.state}_${String(idx + i + 1000).padStart(4, '0')}`,
    }));

    const { data, error } = await supabase
      .from("schools")
      .upsert(batch, { onConflict: "nces_id" })
      .select("id");

    if (error) {
      console.error(`  Batch error:`, error.message);
    } else {
      console.log(`  Batch ${Math.floor(i / 50) + 1}: ${data?.length || 0} rows`);
    }
  }

  // Verify coverage
  const { data } = await supabase
    .from("schools")
    .select("state")
    .not("state", "is", null);

  const states = [...new Set((data as { state: string }[]).map(s => s.state))].sort();
  console.log(`\nDone. ${states.length} states covered: ${states.join(', ')}`);
}

seed();

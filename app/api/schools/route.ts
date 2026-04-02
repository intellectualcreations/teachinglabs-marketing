import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use untyped admin client to bypass supabase-js v2.100 strict generic constraints
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/schools
 * Query params:
 *   - states=true        → returns distinct states
 *   - state=XX           → returns distinct districts in that state
 *   - state=XX&district=YYY → returns schools in that state+district
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const supabase = adminClient();

  // Return distinct states (paginate to get all)
  if (searchParams.get("states") === "true") {
    const allStates: string[] = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from("schools")
        .select("state")
        .not("state", "is", null)
        .order("state")
        .range(from, from + pageSize - 1);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data || data.length === 0) break;
      (data as { state: string }[]).forEach((s) => allStates.push(s.state));
      if (data.length < pageSize) break;
      from += pageSize;
    }

    const states = [...new Set(allStates)].sort();
    return NextResponse.json({ states });
  }

  const state = searchParams.get("state");
  const district = searchParams.get("district");

  // Return districts for a state (paginate to get all, Supabase default is 1000)
  if (state && !district) {
    const allDistricts: string[] = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from("schools")
        .select("district")
        .eq("state", state)
        .not("district", "is", null)
        .order("district")
        .range(from, from + pageSize - 1);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data || data.length === 0) break;
      (data as { district: string }[]).forEach((s) => allDistricts.push(s.district));
      if (data.length < pageSize) break;
      from += pageSize;
    }

    const districts = [...new Set(allDistricts)].sort();
    return NextResponse.json({ districts });
  }

  // Return schools for a state+district (paginate)
  if (state && district) {
    const allSchools: unknown[] = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from("schools")
        .select("id, name, city, zip, address")
        .eq("state", state)
        .eq("district", district)
        .order("name")
        .range(from, from + pageSize - 1);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data || data.length === 0) break;
      allSchools.push(...data);
      if (data.length < pageSize) break;
      from += pageSize;
    }

    return NextResponse.json({ schools: allSchools });
  }

  return NextResponse.json({ error: "Provide ?states=true, ?state=XX, or ?state=XX&district=YYY" }, { status: 400 });
}

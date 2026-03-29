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

  // Return distinct states
  if (searchParams.get("states") === "true") {
    const { data, error } = await supabase
      .from("schools")
      .select("state")
      .not("state", "is", null)
      .order("state");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const states = [...new Set((data as { state: string }[]).map((s) => s.state))];
    return NextResponse.json({ states });
  }

  const state = searchParams.get("state");
  const district = searchParams.get("district");

  // Return districts for a state
  if (state && !district) {
    const { data, error } = await supabase
      .from("schools")
      .select("district")
      .eq("state", state)
      .not("district", "is", null)
      .order("district");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const districts = [...new Set((data as { district: string }[]).map((s) => s.district))];
    return NextResponse.json({ districts });
  }

  // Return schools for a state+district
  if (state && district) {
    const { data, error } = await supabase
      .from("schools")
      .select("id, name, city, zip, address")
      .eq("state", state)
      .eq("district", district)
      .order("name");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ schools: data });
  }

  return NextResponse.json({ error: "Provide ?states=true, ?state=XX, or ?state=XX&district=YYY" }, { status: 400 });
}

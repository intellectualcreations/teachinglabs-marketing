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
 * POST /api/schools/create
 * Body: { name, district?, address?, state, city, zip }
 * Creates a new school (for "I don't see my school" flow).
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, district, address, state, city, zip } = body;

  if (!name || !state || !city) {
    return NextResponse.json(
      { error: "name, state, and city are required" },
      { status: 400 }
    );
  }

  const supabase = adminClient();

  const { data, error } = await supabase
    .from("schools")
    .insert({
      name,
      district: district || null,
      address: address || null,
      state,
      city,
      zip: zip || null,
    })
    .select("id, name")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ school: data });
}

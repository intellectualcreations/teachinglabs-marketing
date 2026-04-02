import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { class_id?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { class_id, content } = body;

  if (!class_id || typeof class_id !== "string") {
    return NextResponse.json(
      { error: "class_id is required" },
      { status: 400 },
    );
  }
  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json(
      { error: "content is required" },
      { status: 400 },
    );
  }

  // Verify student is enrolled in this class
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", user.id)
    .eq("class_id", class_id)
    .eq("status", "active")
    .maybeSingle();

  if (!enrollment) {
    return NextResponse.json(
      { error: "Not enrolled in this class" },
      { status: 403 },
    );
  }

  // Insert student message
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: studentMsg, error: studentErr } = await (supabase
    .from("chat_messages") as any)
    .insert({
      sender_id: user.id,
      class_id,
      content: content.trim(),
      message_type: "student",
    })
    .select()
    .single();

  if (studentErr) {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }

  // Insert placeholder AI acknowledgment (real AI integration comes later)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: aiMsg } = await (supabase
    .from("chat_messages") as any)
    .insert({
      sender_id: user.id,
      class_id,
      content:
        "Thanks for your message! Your AI tutor will respond shortly.",
      message_type: "ai",
    })
    .select()
    .single();

  return NextResponse.json({
    studentMessage: studentMsg,
    aiMessage: aiMsg,
  });
}

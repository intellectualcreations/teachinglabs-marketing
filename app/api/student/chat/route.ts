import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const admin = createAdminClient();

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
  const { data: enrollment } = await admin
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

  // Fetch class info for context
  const { data: classData } = await admin
    .from("classes")
    .select("name, subject, grade_level, description, teacher_id")
    .eq("id", class_id)
    .single();

  const classInfo = classData as { name: string; subject: string | null; grade_level: string | null; description: string | null; teacher_id: string | null } | null;

  let teacherName = "your teacher";
  if (classInfo?.teacher_id) {
    const { data: tp } = await admin
      .from("profiles")
      .select("preferred_name, display_name")
      .eq("id", classInfo.teacher_id)
      .single();
    const teacherProfile = tp as { preferred_name: string | null; display_name: string | null } | null;
    if (teacherProfile) {
      teacherName =
        teacherProfile.preferred_name ||
        teacherProfile.display_name ||
        "your teacher";
    }
  }

  // Fetch student info
  const { data: sp } = await admin
    .from("profiles")
    .select("preferred_name, display_name")
    .eq("id", user.id)
    .single();
  const studentProfile = sp as { preferred_name: string | null; display_name: string | null } | null;

  let studentPreferredName = "";
  // Also check assessment for preferred name
  const { data: assessmentData } = await admin
    .from("student_assessments")
    .select("preferred_name")
    .eq("student_id", user.id)
    .single();

  studentPreferredName =
    (assessmentData as { preferred_name?: string } | null)?.preferred_name ||
    studentProfile?.preferred_name ||
    studentProfile?.display_name?.split(" ")[0] ||
    "Student";

  // Insert student message first
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: studentMsg, error: studentErr } = await (
    admin.from("chat_messages") as any
  )
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

  // Fetch recent conversation history for context (last 20 messages)
  const { data: recentMessages } = await admin
    .from("chat_messages")
    .select("content, message_type, created_at")
    .eq("class_id", class_id)
    .or(`sender_id.eq.${user.id},message_type.eq.ai`)
    .order("created_at", { ascending: true })
    .limit(20);

  // Build conversation history for Claude
  const conversationHistory: { role: "user" | "assistant"; content: string }[] =
    (recentMessages ?? []).map(
      (msg: { content: string; message_type: string }) => ({
        role:
          msg.message_type === "student"
            ? ("user" as const)
            : ("assistant" as const),
        content: msg.content,
      }),
    );

  // Build system prompt
  const className = classInfo?.name || "this class";
  const subject = classInfo?.subject || "general studies";
  const gradeLevel = classInfo?.grade_level || "";
  const classDesc = classInfo?.description || "";

  const systemPrompt = `You are a friendly, encouraging AI tutor for TeachingLabs, a K-12 education platform.

STUDENT: ${studentPreferredName}
CLASS: ${className}
SUBJECT: ${subject}${gradeLevel ? ` (Grade ${gradeLevel})` : ""}
TEACHER: ${teacherName}
${classDesc ? `CLASS DESCRIPTION: ${classDesc}` : ""}

YOUR ROLE:
- You are a patient, encouraging tutor who helps students learn
- Adapt your language to be age-appropriate for ${gradeLevel || "K-12"} students
- Be warm and supportive. Celebrate effort and progress
- When explaining concepts, use simple language and relatable examples
- Ask guiding questions to help students think through problems rather than just giving answers
- If a student seems stuck, break things into smaller steps
- Keep responses concise but helpful. Students have short attention spans
- Use the student's name occasionally to keep it personal
- Stay focused on the class subject (${subject}) but be flexible if they need general help
- Never be condescending. Treat every question as valid
- If you don't know something, say so honestly

SAFETY:
- This is a K-12 educational environment. Keep all content age-appropriate
- Do not discuss anything inappropriate for school settings
- If asked about non-educational topics, gently redirect to learning
- Protect student privacy. Never ask for personal information beyond what's needed for learning

FORMAT:
- Use short paragraphs. Break up long explanations
- Use bullet points or numbered steps when explaining processes
- Include encouragement naturally
- Keep most responses under 150 words unless the student asks for detailed explanation`;

  try {
    // Call Claude for AI response
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20250414",
      max_tokens: 500,
      system: systemPrompt,
      messages: conversationHistory,
    });

    const aiContent =
      response.content[0].type === "text"
        ? response.content[0].text
        : "I'm here to help! What would you like to learn about?";

    // Save AI response to DB
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: aiMsg } = await (admin.from("chat_messages") as any)
      .insert({
        sender_id: user.id,
        class_id,
        content: aiContent,
        message_type: "ai",
      })
      .select()
      .single();

    return NextResponse.json({
      studentMessage: studentMsg,
      aiMessage: aiMsg,
    });
  } catch (err) {
    console.error("[chat] AI error:", err);

    // Fallback if AI fails
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: aiMsg } = await (admin.from("chat_messages") as any)
      .insert({
        sender_id: user.id,
        class_id,
        content:
          "I'm having a little trouble right now, but I'm still here! Can you try asking that again?",
        message_type: "ai",
      })
      .select()
      .single();

    return NextResponse.json({
      studentMessage: studentMsg,
      aiMessage: aiMsg,
    });
  }
}

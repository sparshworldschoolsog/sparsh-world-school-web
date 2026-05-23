import { NextResponse } from "next/server";
import { sendBothEmails, validate } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const result = validate(body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  try {
    await sendBothEmails(result.data);
  } catch (err) {
    // Distinguish configuration errors (developer fault) from delivery errors (transient).
    const message = err instanceof Error ? err.message : "Unknown email error";
    const isConfigError = message.includes("not configured");
    console.error("submit-form error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: isConfigError
          ? "Email service is not configured on the server. Please contact the school directly."
          : "We couldn't deliver your message right now. Please try again in a moment.",
      },
      { status: isConfigError ? 500 : 502 },
    );
  }

  return NextResponse.json({ ok: true });
}

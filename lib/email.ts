import "server-only";
import { Resend } from "resend";

/* ────────────────────────────────────────────────────────────────────────── */
/* Types                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

export interface ContactPayload {
  formType: "contact";
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface StudentRequestPayload {
  formType: "student_request";
  studentName: string;
  parentName: string;
  grade: string;
  phone: string;
  email: string;
  query: string;
}

export interface ChatbotLeadPayload {
  formType: "chatbot_lead";
  name: string;
  email: string;
  phone: string;
  message: string;
  /** Optional topic chip the user picked in the chat (e.g. "admissions", "fees"). */
  topic?: string;
}

export type FormPayload = ContactPayload | StudentRequestPayload | ChatbotLeadPayload;

/* ────────────────────────────────────────────────────────────────────────── */
/* Config                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

const INTERNAL_TO =
  process.env.INTERNAL_EMAIL ?? "sparshworldschoolsog@gmail.com";
const FROM_ADDRESS = process.env.RESEND_FROM ?? "info@sparshworld.in";
const WHATSAPP_NUMBER = process.env.SCHOOL_WHATSAPP_NUMBER ?? ""; // E.164 digits only, e.g. "919876543210"
const WHATSAPP_GREETING = encodeURIComponent(
  "Hi! I just submitted a form on the Sparsh World School website and would like to chat.",
);

/* ────────────────────────────────────────────────────────────────────────── */
/* Resend client (cached per process)                                        */
/* ────────────────────────────────────────────────────────────────────────── */

let cachedClient: Resend | null = null;

export function getResend(): Resend {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Email transport is not configured. Set RESEND_API_KEY in your environment.",
    );
  }

  cachedClient = new Resend(apiKey);
  return cachedClient;
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Validation                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isStr = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const isEmail = (v: unknown): v is string => typeof v === "string" && EMAIL_RE.test(v);

type ValidationResult<T> = { ok: true; data: T } | { ok: false; error: string };

export function validate(body: unknown): ValidationResult<FormPayload> {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid payload" };
  }
  const p = body as Record<string, unknown>;

  if (p.formType === "contact") {
    if (!isStr(p.name)) return { ok: false, error: "Name is required" };
    if (!isEmail(p.email)) return { ok: false, error: "Valid email is required" };
    if (!isStr(p.phone)) return { ok: false, error: "Phone is required" };
    if (!isStr(p.message)) return { ok: false, error: "Message is required" };
    return {
      ok: true,
      data: {
        formType: "contact",
        name: p.name.trim(),
        email: p.email.trim(),
        phone: p.phone.trim(),
        message: p.message.trim(),
      },
    };
  }

  if (p.formType === "chatbot_lead") {
    if (!isStr(p.name)) return { ok: false, error: "Name is required" };
    if (!isEmail(p.email)) return { ok: false, error: "Valid email is required" };
    if (!isStr(p.phone)) return { ok: false, error: "Phone is required" };
    if (!isStr(p.message)) return { ok: false, error: "Message is required" };
    return {
      ok: true,
      data: {
        formType: "chatbot_lead",
        name: p.name.trim(),
        email: p.email.trim(),
        phone: p.phone.trim(),
        message: p.message.trim(),
        topic: typeof p.topic === "string" && p.topic.trim().length > 0 ? p.topic.trim() : undefined,
      },
    };
  }

  if (p.formType === "student_request") {
    if (!isStr(p.studentName)) return { ok: false, error: "Student name is required" };
    if (!isStr(p.parentName)) return { ok: false, error: "Parent/Guardian name is required" };
    if (!isStr(p.grade)) return { ok: false, error: "Target grade is required" };
    if (!isStr(p.phone)) return { ok: false, error: "Phone is required" };
    if (!isEmail(p.email)) return { ok: false, error: "Valid email is required" };
    if (!isStr(p.query)) return { ok: false, error: "Specific query is required" };
    return {
      ok: true,
      data: {
        formType: "student_request",
        studentName: p.studentName.trim(),
        parentName: p.parentName.trim(),
        grade: p.grade.trim(),
        phone: p.phone.trim(),
        email: p.email.trim(),
        query: p.query.trim(),
      },
    };
  }

  return { ok: false, error: "Unknown formType" };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* HTML escape (safety for email templating)                                 */
/* ────────────────────────────────────────────────────────────────────────── */

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHtml = (s: string): string => s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

/* ────────────────────────────────────────────────────────────────────────── */
/* Internal notification email                                               */
/* ────────────────────────────────────────────────────────────────────────── */

function buildInternalEmail(p: FormPayload): { subject: string; html: string; text: string } {
  let rows: [string, string][];
  let title: string;
  let subject: string;

  if (p.formType === "contact") {
    rows = [
      ["Name", p.name],
      ["Email", p.email],
      ["Phone", p.phone],
      ["Message", p.message],
    ];
    title = "New Contact Form Submission";
    subject = `New Contact — ${p.name}`;
  } else if (p.formType === "chatbot_lead") {
    rows = [
      ["Name", p.name],
      ["Email", p.email],
      ["Phone", p.phone],
      ["Message", p.message],
    ];
    if (p.topic) rows.splice(3, 0, ["Topic", p.topic]);
    title = "New Chatbot Lead";
    subject = `New Chat Lead — ${p.name}${p.topic ? ` (${p.topic})` : ""}`;
  } else {
    rows = [
      ["Student Name", p.studentName],
      ["Parent / Guardian", p.parentName],
      ["Target Grade", p.grade],
      ["Phone", p.phone],
      ["Email", p.email],
      ["Specific Query", p.query],
    ];
    title = "New Student & Admission Request";
    subject = `New Admission Request — ${p.studentName} (Grade ${p.grade})`;
  }

  const text = `${title}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}`;

  const html = `<!doctype html>
<html><body style="margin:0;background:#0b1228;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;color:#e8eaf2;line-height:1.55">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:32px 16px;background:#0b1228">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden">
        <tr><td style="padding:28px 28px 12px">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#9aa6c4">Sparsh World School · Form Inbox</p>
          <h1 style="margin:6px 0 0;font-family:Georgia,serif;font-size:22px;color:#fff">${escapeHtml(title)}</h1>
        </td></tr>
        <tr><td style="padding:12px 28px 28px">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse">
            ${rows
              .map(
                ([k, v]) => `
              <tr>
                <td style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#a5b0c9;width:38%;vertical-align:top">${escapeHtml(k)}</td>
                <td style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;color:#fff;vertical-align:top">${escapeHtml(v).replace(/\n/g, "<br>")}</td>
              </tr>`,
              )
              .join("")}
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject, html, text };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Auto-responder email                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

function buildAutoResponder(p: FormPayload): {
  subject: string;
  html: string;
  text: string;
  to: string;
  greetingName: string;
} {
  const to = p.email;
  const greetingName = p.formType === "student_request" ? p.parentName : p.name;
  const firstName = greetingName.split(" ")[0];
  const inquiryNoun = p.formType === "student_request" ? "admission inquiry" : "message";

  const whatsappUrl = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_GREETING}`
    : "";

  const subject = "Thank you for reaching out — Sparsh World School";

  const text = [
    `Dear ${firstName},`,
    "",
    `Thank you for reaching out to Sparsh World School. We've received your ${
      inquiryNoun
    } and a member of our team will be in touch within 24 hours.`,
    "",
    "For instant communication, you can also reach us on WhatsApp:",
    whatsappUrl || "(WhatsApp link will be available shortly.)",
    "",
    "Warm regards,",
    "The Sparsh World School Team",
    "info@sparshworld.in",
  ].join("\n");

  const html = `<!doctype html>
<html><body style="margin:0;background:#0b1228;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;color:#e8eaf2;line-height:1.6">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:48px 16px;background:#0b1228">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px">
        <tr><td style="padding:40px 36px 12px">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:#9aa6c4">SPARSH WORLD SCHOOL</p>
          <h1 style="margin:0;font-family:Georgia,serif;font-size:28px;color:#fff;line-height:1.2">Thank you, ${escapeHtml(firstName)}.</h1>
        </td></tr>
        <tr><td style="padding:0 36px 24px">
          <p style="margin:18px 0 14px;font-size:15px;color:#d4dbf0">We've received your ${
            inquiryNoun
          } and a member of our team will be in touch within 24 hours.</p>
          <p style="margin:0 0 24px;font-size:15px;color:#d4dbf0">For instant communication, reach us on WhatsApp using the button below — we usually reply within minutes during school hours.</p>
          ${
            whatsappUrl
              ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="background:#25D366;border-radius:999px">
              <a href="${whatsappUrl}" style="display:inline-block;color:#ffffff;text-decoration:none;font-weight:600;padding:14px 26px;font-size:14px;line-height:1">Chat on WhatsApp &nbsp;→</a>
            </td></tr>
          </table>`
              : `<p style="margin:0;color:#a5b0c9;font-size:13px">(Our WhatsApp line will be available shortly.)</p>`
          }
        </td></tr>
        <tr><td style="padding:0 36px 36px">
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:8px 0 24px">
          <p style="margin:0;font-size:13px;color:#a5b0c9">Warm regards,<br><strong style="color:#d4dbf0">The Sparsh World School Team</strong><br><a href="mailto:info@sparshworld.in" style="color:#a5b0c9">info@sparshworld.in</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject, html, text, to, greetingName };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Public: send both emails in parallel via Resend                           */
/* ────────────────────────────────────────────────────────────────────────── */

export async function sendBothEmails(payload: FormPayload): Promise<void> {
  const resend = getResend();
  const internal = buildInternalEmail(payload);
  const reply = buildAutoResponder(payload);

  const [internalResult, replyResult] = await Promise.all([
    resend.emails.send({
      from: `Sparsh World School Forms <${FROM_ADDRESS}>`,
      to: [INTERNAL_TO],
      replyTo: payload.email,
      subject: internal.subject,
      text: internal.text,
      html: internal.html,
    }),
    resend.emails.send({
      from: `Sparsh World School <${FROM_ADDRESS}>`,
      to: [reply.to],
      subject: reply.subject,
      text: reply.text,
      html: reply.html,
    }),
  ]);

  if (internalResult.error) {
    throw new Error(
      `Resend (internal notification) failed: ${internalResult.error.message}`,
    );
  }
  if (replyResult.error) {
    throw new Error(
      `Resend (auto-responder) failed: ${replyResult.error.message}`,
    );
  }
}

import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs";

function getGroq(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("AI chat is not configured. Set GROQ_API_KEY in your environment.");
  }
  return new Groq({ apiKey });
}

const MODELS = ["qwen/qwen3.6-27b", "openai/gpt-oss-20b"];

const SYSTEM_PROMPT = `You are Sparsh Assistant, the official AI assistant for Sparsh World School. You help visitors learn about the school, assist current students with academic support, and help prospective families through the admissions process. Be warm, professional, and concise (2-3 paragraphs max).

ABOUT SPARSH WORLD SCHOOL:
- Full name: Sparsh World School
- Motto: "The Power of Education, The Touch of Excellence"
- Curriculum: ICSE (Nursery to Grade 12)
- Core values: Rigorous ICSE academics, character development (integrity, empathy, resilience), and diverse extracurriculars (robotics, debate, music, athletics, coding)
- Location: Coordinates 29°19'20.6"N 73°55'39.1"E
- Hours: Mon-Sat 8 AM - 4 PM, Sunday Closed
- Phone: +91 90010 69318 | Email: info@sparshworld.in | WhatsApp: +919001069318

LEADERSHIP TEAM:
1. CA. Sunill K. Talwar - Founder (FCA, M.Com, 15 yrs experience)
2. Ms Sangeeta Talwar - Principal (MSc Maths, B.Ed, 6 yrs)
3. Ms Shalu Raj Talwar - Senior Academic In-charge (Double MA Sociology & Hindi, B.Ed, 10 yrs)
4. Rohit Wadhwa - H.O.D. Curricular & Co-Curricular Activities (MSc IT, 15 yrs)
5. Ms Anuradha Laroiya - Kindergarten Academic In-charge (MA Hindi, 20+ yrs)

FACILITIES:
1. Advanced Science Labs - Physics, Chemistry, Biology benches, fume hood, dissection bay, 16 stations per lab, open during evening study
2. Next-Gen Computer Lab - 40 iMac & Windows workstations, robotics & 3D printing bay, 1 Gbps fiber, Saturday Coding Club for grades 6-12
3. Interactive Library - 30,000+ titles, silent & collaborative zones, digital journals & e-book lending, open 7 AM - 8 PM
4. Sports Complex - FIFA-spec football turf, 25m heated swimming pool, indoor badminton & table tennis, strength & conditioning gym
5. Smart Classrooms - 86-inch interactive touch panels, circadian-tuned lighting, acoustic-treated, built-in lesson recording
6. Secure Transport - GPS-tracked with parent app, biometric boarding, female attendant on every bus, speed governors capped at 40 km/h

ADMISSIONS PROCESS:
1. Share child's details and contact info via the Student Request form on the website
2. Get a confirmation email with a WhatsApp link for fast follow-up
3. An admissions counselor schedules a personal campus visit and next steps
For quick questions, visitors can use the chat or email info@sparshworld.in. Admissions team responds within 24 hours.

HOW YOU HELP:
- STUDENTS: Answer academic questions, explain concepts, guide study habits, suggest resources. Sound like a supportive mentor. Even when someone just says hi, immediately ask what subject they need help with or what they're studying.
- ADMISSIONS: Explain the ICSE curriculum, highlight facilities, describe the admission process, share the school's values. Encourage form fills and campus visits. Even on a hello, ask if they're exploring schools for their child.
- GENERAL: Answer questions about school life, timings, transport, fees (direct to admin for exact figures). For detailed fee/policy questions, ask visitors to contact the school directly.

RULES:
- Use "Namaste" occasionally. Be warm but professional.
- CRITICAL: When the user sends a casual greeting like "hi", "hello", "hii", "hey" (just a greeting with no real question) — do NOT reply with a generic greeting back. Instead, immediately pivot to offering focused help. For example: acknowledge briefly then ask if they need help with a specific subject, homework, exam prep, or admissions info. Never waste the opportunity.
- For specific fee numbers, dates, or policies: say "Please contact the school at info@sparshworld.in or call +91 90010 69318 for exact details."
- If someone wants a human: tell them the contact form or "Talk to human" button will appear.
- Keep responses under 3 paragraphs. Be concise.
- Sound proud of the school but humble.`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  messages: Message[];
}

async function tryModel(groq: Groq, model: string, messages: any[], controller: ReadableStreamDefaultController, encoder: TextEncoder): Promise<boolean> {
  try {
    const completion = await groq.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
    });

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        controller.enqueue(encoder.encode(content));
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request): Promise<Response> {
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
  }

  let groq: Groq;
  try {
    groq = getGroq();
  } catch {
    return NextResponse.json(
      { error: "AI chat is not configured. Please contact the school directly." },
      { status: 500 },
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const msgs: any[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...body.messages,
      ];

      for (const model of MODELS) {
        const ok = await tryModel(groq, model, msgs, controller, encoder);
        if (ok) {
          controller.close();
          return;
        }
      }

      controller.enqueue(encoder.encode("I'm currently unavailable. Please reach out at info@sparshworld.in or call +91 90010 69318. Our team will respond within 24 hours."));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}

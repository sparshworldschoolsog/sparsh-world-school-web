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

const SYSTEM_PROMPT = `You are the Sparsh Assistant, an AI assistant for Sparsh World School. You are helpful, warm, and professional.

ABOUT SPARSH WORLD SCHOOL:
- An ICSE-curriculum school focused on academic excellence, character development, and global-mindedness
- Located with world-class facilities including: Advanced Science Labs (Physics, Chemistry, Biology), Next-Gen Computer Lab (40 workstations, robotics bay), Interactive Library (30,000+ titles), Sports Complex (FIFA-spec turf, 25m pool, indoor courts), Smart Classrooms (86-inch interactive panels, circadian lighting), Secure Transport System (GPS-tracked, biometric boarding, female attendants)
- Offers ICSE from Nursery to Grade 12
- Core values: Academic Excellence, Character, Creativity, Community

WHAT YOU CAN HELP WITH:
- Answer questions about the school, facilities, curriculum, and values
- Explain the admission process and fee structure
- Provide information about extracurricular activities
- Schedule campus visits and tours
- General inquiries about school life

RULES:
- Be concise but warm. Use "Namaste" occasionally as a greeting.
- If a user wants to speak to a human or needs personalized assistance (specific enrollment, fees discussion, etc.), tell them you'll connect them and the contact form will appear.
- Never make up specific fee numbers, dates, or policies — direct users to contact the school admin for exact figures.
- Keep responses under 3 paragraphs for readability.
- Sound like a real school assistant — proud of the school but humble.

For reference, the school WhatsApp number for India: +919001069318.`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  messages: Message[];
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
      try {
        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...body.messages,
          ],
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
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Groq API error:", err);
        controller.enqueue(encoder.encode(`\n\nSorry, I encountered an error. Please try again or contact the school directly.`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}

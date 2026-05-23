import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import StudentRequestForm from "@/components/forms/StudentRequestForm";

export const metadata: Metadata = {
  title: "Student & Admission Request · Sparsh World School",
  description:
    "Begin your child's admissions journey at Sparsh World School. Share details and our team will reach out within 24 hours.",
};

const STEPS = [
  {
    title: "Share Details",
    body: "Fill in your child's information and your contact details.",
  },
  {
    title: "Quick Confirmation",
    body: "You'll receive an email with a WhatsApp link for fast follow-up.",
  },
  {
    title: "Personal Walk-Through",
    body: "Our admissions counselor schedules a visit and next steps with you.",
  },
];

export default function StudentRequestPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-24 pt-28 md:px-8 md:pb-32 md:pt-36">
      <header className="mb-12 max-w-2xl md:mb-16">
        <span className="font-crest text-xs text-white/70 md:text-sm">
          Sparsh · Admissions
        </span>
        <h1 className="font-crest mt-3 text-4xl leading-[1.05] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)] md:text-6xl lg:text-7xl">
          Student &amp; Admission Request
        </h1>
        <p className="mt-5 text-base text-white/80 md:text-lg">
          Tell us about your child and what you're looking for. Our admissions
          team will be in touch within 24 hours with the next steps tailored to
          you.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <StudentRequestForm />
        </div>

        <aside className="space-y-6 lg:col-span-2">
          <div className="glass-panel rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                <Sparkles size={18} />
              </div>
              <h2 className="font-crest text-xl text-white md:text-2xl">
                What Happens Next
              </h2>
            </div>
            <ol className="mt-6 space-y-5">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex items-start gap-4">
                  <span className="font-crest mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-crest text-base text-white">{s.title}</p>
                    <p className="mt-1 text-sm text-white/75">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="glass-panel rounded-3xl p-6 md:p-8">
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-white/55">
              Need to chat first?
            </p>
            <p className="mt-2 text-sm text-white/85">
              Use the chat button at the bottom-right corner to ask quick
              questions before you submit — or write to{" "}
              <a
                href="mailto:info@sparshworld.in"
                className="text-white underline decoration-white/40 underline-offset-4 transition hover:decoration-white"
              >
                info@sparshworld.in
              </a>
              .
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

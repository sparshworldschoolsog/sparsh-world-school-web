"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  GraduationCap,
  IndianRupee,
  UserRound,
  Mail,
  Phone,
  MessageSquare,
  Loader2,
  AlertCircle,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Topic = "admissions" | "fees" | "contact_human";
type Message = { from: "bot" | "user"; text: string };
type Status = "idle" | "submitting" | "success" | "error";

const OPEN_EVENT = "sparsh:open-chat";

const TOPIC_PROMPTS: Record<Topic, { user: string; bot: string }> = {
  admissions: {
    user: "Admissions",
    bot: "Wonderful. Share your name, email, and what you'd like to know — our admissions team will reply within 24 hours.",
  },
  fees: {
    user: "Fees",
    bot: "Happy to help. Drop your name, email, and a quick note and we'll send the latest fee structure to your inbox.",
  },
  contact_human: {
    user: "Talk to a human",
    bot: "Of course. Leave your details below and someone from our team will reach out personally.",
  },
};

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "bot",
      text: "Namaste! I'm the Sparsh Assistant. How can I help you today?",
    },
  ]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, handler);
    return () => window.removeEventListener(OPEN_EVENT, handler);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, topic, status]);

  const pickTopic = (t: Topic) => {
    setTopic(t);
    setMessages((m) => [
      ...m,
      { from: "user", text: TOPIC_PROMPTS[t].user },
      { from: "bot", text: TOPIC_PROMPTS[t].bot },
    ]);
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!topic) return;
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "chatbot_lead",
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message,
          topic,
        }),
      });
      const json: { ok?: boolean; error?: string } = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Submission failed");

      setStatus("success");
      setMessages((m) => [
        ...m,
        { from: "user", text: `${form.name} · ${form.email} · ${form.phone}` },
        {
          from: "bot",
          text:
            "Thanks! We've received your details and sent a confirmation to your email. We'll be in touch soon.",
        },
      ]);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Submission failed");
    }
  }

  const reset = () => {
    setTopic(null);
    setStatus("idle");
    setError(null);
    setForm({ name: "", email: "", phone: "", message: "" });
    setMessages([{ from: "bot", text: "How else can I help you?" }]);
  };

  return (
    <>
      <motion.button
        type="button"
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="glass-panel fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "x" : "msg"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {open ? <X size={22} /> : <MessageCircle size={22} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="glass-panel fixed bottom-24 right-5 z-[60] flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-3xl text-white"
          >
            <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                <MessageCircle size={16} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">Sparsh Assistant</span>
                <span className="text-[0.65rem] text-white/60">
                  Online · usually replies instantly
                </span>
              </div>
            </header>

            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm"
            >
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2",
                    m.from === "bot"
                      ? "bg-white/10 text-white/90"
                      : "ml-auto bg-blue-500/40 text-white",
                  )}
                >
                  {m.text}
                </motion.div>
              ))}

              {status === "submitting" && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex max-w-[80%] items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-white/80"
                >
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-xs">Sending your details…</span>
                </motion.div>
              )}

              {!topic && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <TopicChip
                    icon={<GraduationCap size={14} />}
                    label="Admissions"
                    onClick={() => pickTopic("admissions")}
                  />
                  <TopicChip
                    icon={<IndianRupee size={14} />}
                    label="Fees"
                    onClick={() => pickTopic("fees")}
                  />
                  <TopicChip
                    icon={<Headphones size={14} />}
                    label="Talk to a human"
                    onClick={() => pickTopic("contact_human")}
                  />
                </div>
              )}

              {topic && status !== "success" && (
                <motion.form
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  onSubmit={submit}
                  noValidate
                  className="mt-3 space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-sm"
                >
                  <Field
                    icon={<UserRound size={14} />}
                    placeholder="Your name"
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                    autoComplete="name"
                    required
                    disabled={status === "submitting"}
                  />
                  <Field
                    icon={<Mail size={14} />}
                    placeholder="Email address"
                    type="email"
                    value={form.email}
                    onChange={(v) => setForm({ ...form, email: v })}
                    autoComplete="email"
                    required
                    disabled={status === "submitting"}
                  />
                  <Field
                    icon={<Phone size={14} />}
                    placeholder="Phone number"
                    type="tel"
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                    autoComplete="tel"
                    required
                    disabled={status === "submitting"}
                  />
                  <TextArea
                    icon={<MessageSquare size={14} />}
                    placeholder="A brief message…"
                    value={form.message}
                    onChange={(v) => setForm({ ...form, message: v })}
                    required
                    disabled={status === "submitting"}
                  />

                  {status === "error" && error && (
                    <div className="flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-2.5 py-2 text-xs text-rose-100">
                      <AlertCircle size={12} className="mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/25 disabled:cursor-wait disabled:opacity-60"
                  >
                    {status === "submitting" ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Sending…
                      </>
                    ) : (
                      <>
                        <Send size={14} /> Send
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {status === "success" && (
                <button
                  type="button"
                  onClick={reset}
                  className="mt-2 text-xs text-white/60 underline-offset-2 hover:text-white hover:underline"
                >
                  Ask something else
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function TopicChip({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/90 transition hover:bg-white/15"
    >
      {icon}
      {label}
    </button>
  );
}

interface FieldBaseProps {
  icon?: ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}

function Field({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  required,
  disabled,
  autoComplete,
}: FieldBaseProps & { type?: string }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-3 py-2 text-sm backdrop-blur-sm transition focus-within:border-white/30 focus-within:bg-white/[0.09]">
      {icon && <span className="text-white/60">{icon}</span>}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className="flex-1 bg-transparent text-white placeholder-white/40 outline-none disabled:opacity-60"
      />
    </label>
  );
}

function TextArea({
  icon,
  placeholder,
  value,
  onChange,
  required,
  disabled,
}: FieldBaseProps) {
  return (
    <label className="flex items-start gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-3 py-2 text-sm backdrop-blur-sm transition focus-within:border-white/30 focus-within:bg-white/[0.09]">
      {icon && <span className="mt-1 text-white/60">{icon}</span>}
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        rows={3}
        className="flex-1 resize-none bg-transparent text-white placeholder-white/40 outline-none disabled:opacity-60"
      />
    </label>
  );
}

export default ChatBot;

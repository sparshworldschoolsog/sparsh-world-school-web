"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  AlertCircle,
  Headphones,
  Bot,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };
type Status = "idle" | "loading" | "streaming" | "form" | "submitting" | "success" | "error";

const OPEN_EVENT = "sparsh:open-chat";

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Namaste! I'm the Sparsh Assistant. Ask me anything about the school — admissions, facilities, curriculum, or campus life. I'm here to help!",
    },
  ]);
  const [input, setInput] = useState("");
  const [streamingId, setStreamingId] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
  }, [messages, status]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text || status === "loading" || status === "streaming") return;
    setInput("");

    const userMsg: Message = { role: "user", content: text };
    const botIdx = messages.length + 1;
    const updated: Message[] = [...messages, userMsg, { role: "assistant", content: "" }];
    setMessages(updated);
    setStreamingId(botIdx);
    setStatus("loading");
    setError(null);

    const history: { role: "user" | "assistant"; content: string }[] = updated.slice(0, -1).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? "Failed to get response");
      }

      setStatus("streaming");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let done = false;
      let accumulated = "";

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const next = [...prev];
            if (next[botIdx]) next[botIdx] = { ...next[botIdx], content: accumulated };
            return next;
          });
        }
      }
      setStatus("idle");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setMessages((prev) => {
        const next = [...prev];
        if (next[botIdx]) {
          next[botIdx] = {
            role: "assistant",
            content: msg,
          };
        }
        return next;
      });
      setStatus("error");
    } finally {
      setStreamingId(null);
      abortRef.current = null;
    }
  }

  const openContactForm = () => {
    setStatus("form");
    setForm({ name: "", email: "", phone: "", message: "" });
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "Of course! Please share your details below and our team will reach out to you personally.",
      },
    ]);
  };

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
          message: form.message || "Contact request via AI chat",
          topic: "contact_human",
        }),
      });
      const json: { ok?: boolean; error?: string } = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Submission failed");

      setStatus("success");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Thanks! We've received your details and sent a confirmation to your email. Our team will be in touch within 24 hours. Is there anything else I can help you with?",
        },
      ]);
    } catch (err) {
      setStatus("form");
      setError(err instanceof Error ? err.message : "Submission failed");
    }
  }

  const reset = () => {
    setStatus("idle");
    setError(null);
    setInput("");
    setForm({ name: "", email: "", phone: "", message: "" });
    setMessages([
      {
        role: "assistant",
        content: "How else can I help you? Ask me anything about Sparsh World School.",
      },
    ]);
    setStreamingId(null);
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
                <Bot size={16} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">Sparsh Assistant</span>
                <span className="text-[0.65rem] text-white/60">
                  {status === "streaming" ? "Typing..." : "Online · AI-powered"}
                </span>
              </div>
              <button
                type="button"
                onClick={openContactForm}
                disabled={status === "form" || status === "submitting"}
                className="ml-auto flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[0.6rem] font-medium text-white/80 transition hover:bg-white/20 disabled:opacity-50"
              >
                <Headphones size={11} />
                Talk to human
              </button>
            </header>

            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm scrollbar-hide"
            >
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex items-start gap-2 max-w-[90%]",
                    m.role === "user" ? "ml-auto flex-row-reverse" : "flex-row",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                      m.role === "user" ? "bg-blue-500/30" : "bg-white/10",
                    )}
                  >
                    {m.role === "user" ? <User size={12} /> : <Bot size={12} />}
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl px-3 py-2",
                      m.role === "user"
                        ? "bg-blue-500/40 text-white"
                        : streamingId === i
                          ? "bg-white/10 text-white/90"
                          : "bg-white/10 text-white/90",
                    )}
                  >
                    {m.content}
                    {streamingId === i && (
                      <span className="inline-block w-1.5 animate-pulse bg-white/70 ml-0.5 rounded-full h-4 align-text-bottom" />
                    )}
                  </div>
                </motion.div>
              ))}

              {status === "loading" && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-white/80 max-w-[80%]"
                >
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-xs">Thinking...</span>
                </motion.div>
              )}

              {(status === "form" || status === "submitting") && (
                <motion.form
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={submitForm}
                  noValidate
                  className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-sm"
                >
                  <Field
                    placeholder="Your name"
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                    required
                    disabled={status === "submitting"}
                  />
                  <Field
                    placeholder="Email address"
                    type="email"
                    value={form.email}
                    onChange={(v) => setForm({ ...form, email: v })}
                    required
                    disabled={status === "submitting"}
                  />
                  <Field
                    placeholder="Phone number"
                    type="tel"
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                    required
                    disabled={status === "submitting"}
                  />
                  <TextAreaField
                    placeholder="A brief message (optional)..."
                    value={form.message}
                    onChange={(v) => setForm({ ...form, message: v })}
                    disabled={status === "submitting"}
                  />

                  {error && (
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
                        <Loader2 size={14} className="animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <Send size={14} /> Send
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {status === "error" && error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-2.5 py-2 text-xs text-rose-100">
                  <AlertCircle size={12} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {status !== "success" && status !== "form" && (
              <div className="border-t border-white/10 px-4 py-3">
                <form onSubmit={sendMessage} className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    disabled={status === "loading" || status === "streaming"}
                    className="flex-1 rounded-xl border border-white/12 bg-white/[0.06] px-3 py-2 text-sm text-white placeholder-white/40 outline-none transition focus:border-white/30 focus:bg-white/[0.09] disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || status === "loading" || status === "streaming"}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white transition hover:bg-white/25 disabled:opacity-30"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            )}

            {status === "success" && (
              <div className="border-t border-white/10 px-4 py-3">
                <button
                  type="button"
                  onClick={reset}
                  className="w-full rounded-xl bg-white/10 py-2 text-xs text-white/80 transition hover:bg-white/20"
                >
                  Ask something else
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Field({
  placeholder,
  value,
  onChange,
  type = "text",
  required,
  disabled,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-3 py-2 text-sm backdrop-blur-sm transition focus-within:border-white/30 focus-within:bg-white/[0.09]">
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className="flex-1 bg-transparent text-white placeholder-white/40 outline-none disabled:opacity-60"
      />
    </label>
  );
}

function TextAreaField({
  placeholder,
  value,
  onChange,
  disabled,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-start gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-3 py-2 text-sm backdrop-blur-sm transition focus-within:border-white/30 focus-within:bg-white/[0.09]">
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={2}
        className="flex-1 resize-none bg-transparent text-white placeholder-white/40 outline-none disabled:opacity-60"
      />
    </label>
  );
}

export default ChatBot;

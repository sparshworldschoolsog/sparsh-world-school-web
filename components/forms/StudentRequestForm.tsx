"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  User,
  Users,
  GraduationCap,
  Mail,
  Phone,
  HelpCircle,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { TextField, TextAreaField } from "@/components/forms/Field";

interface StudentState {
  studentName: string;
  parentName: string;
  grade: string;
  phone: string;
  email: string;
  query: string;
}

const EMPTY: StudentState = {
  studentName: "",
  parentName: "",
  grade: "",
  phone: "",
  email: "",
  query: "",
};

type Status = "idle" | "submitting" | "success" | "error";

export function StudentRequestForm() {
  const [state, setState] = useState<StudentState>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof StudentState>(key: K, value: StudentState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formType: "student_request", ...state }),
      });
      const json: { ok?: boolean; error?: string } = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "Submission failed");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Submission failed");
    }
  }

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel rounded-3xl p-10 text-center md:p-14"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="font-crest text-2xl text-white md:text-3xl">
          Admission Request Received
        </h2>
        <p className="mx-auto mt-3 max-w-md text-white/75">
          Thank you. Our admissions team will reach out within 24 hours. A
          confirmation email — including next steps and a WhatsApp link — is on
          its way to your inbox.
        </p>
        <button
          type="button"
          onClick={() => {
            setState(EMPTY);
            setStatus("idle");
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Submit another request
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onSubmit={onSubmit}
      noValidate
      className="glass-panel space-y-5 rounded-3xl p-6 md:p-8"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField
          label="Student Name"
          name="studentName"
          icon={<User size={16} />}
          value={state.studentName}
          onChange={(v) => update("studentName", v)}
          placeholder="e.g. Ananya Sharma"
          required
        />
        <TextField
          label="Parent / Guardian Name"
          name="parentName"
          icon={<Users size={16} />}
          value={state.parentName}
          onChange={(v) => update("parentName", v)}
          placeholder="e.g. Rohit Sharma"
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField
          label="Target Grade / Class"
          name="grade"
          icon={<GraduationCap size={16} />}
          value={state.grade}
          onChange={(v) => update("grade", v)}
          placeholder="e.g. Grade 6, Nursery, ..."
          required
        />
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          icon={<Phone size={16} />}
          value={state.phone}
          onChange={(v) => update("phone", v)}
          placeholder="+91 ..."
          required
          autoComplete="tel"
        />
      </div>
      <TextField
        label="Email"
        name="email"
        type="email"
        icon={<Mail size={16} />}
        value={state.email}
        onChange={(v) => update("email", v)}
        placeholder="parent@example.com"
        required
        autoComplete="email"
      />
      <TextAreaField
        label="Specific Query"
        name="query"
        icon={<HelpCircle size={16} />}
        value={state.query}
        onChange={(v) => update("query", v)}
        placeholder="Tell us about your child, what you're looking for, and any questions you have."
        rows={6}
        required
      />

      {status === "error" && error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-sky-100 disabled:cursor-wait disabled:opacity-60 md:w-auto"
      >
        {status === "submitting" ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Submitting…
          </>
        ) : (
          <>
            Submit Request{" "}
            <Send
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </>
        )}
      </button>
    </motion.form>
  );
}

export default StudentRequestForm;

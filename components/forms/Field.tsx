"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BaseFieldProps {
  label: string;
  name: string;
  required?: boolean;
  icon?: ReactNode;
  className?: string;
}

interface TextFieldProps extends BaseFieldProps {
  type?: "text" | "email" | "tel";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
}

interface TextAreaFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const fieldShell =
  "flex items-start gap-3 rounded-2xl border border-white/15 bg-white/[0.06] " +
  "px-4 py-3 backdrop-blur-md transition " +
  "focus-within:border-white/40 focus-within:bg-white/[0.08]";

export function TextField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  icon,
  autoComplete,
  className,
}: TextFieldProps) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.28em] text-white/65">
        {label}
        {required && <span className="ml-1 text-rose-300/85">*</span>}
      </span>
      <div className={fieldShell}>
        {icon && <span className="mt-0.5 shrink-0 text-white/60">{icon}</span>}
        <input
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="w-full bg-transparent text-sm text-white placeholder-white/35 outline-none"
        />
      </div>
    </label>
  );
}

export function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  icon,
  rows = 5,
  className,
}: TextAreaFieldProps) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.28em] text-white/65">
        {label}
        {required && <span className="ml-1 text-rose-300/85">*</span>}
      </span>
      <div className={fieldShell}>
        {icon && <span className="mt-0.5 shrink-0 text-white/60">{icon}</span>}
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className="w-full resize-none bg-transparent text-sm text-white placeholder-white/35 outline-none"
        />
      </div>
    </label>
  );
}

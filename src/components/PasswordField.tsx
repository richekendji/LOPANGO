"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

const fieldClass =
  "w-full rounded-2xl border border-[#ebebeb] bg-white py-3 pl-4 pr-12 text-sm text-zinc-900 outline-none focus:border-zinc-400";

type Props = {
  name: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
};

/** Champ mot de passe avec bouton Afficher / Masquer. */
export function PasswordField({
  name,
  label,
  placeholder,
  autoComplete = "current-password",
  minLength,
  required = true,
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </span>
      <div className="relative">
        <input
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className={fieldClass}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
        >
          <Icon name={visible ? "eyeOff" : "eye"} className="h-5 w-5" />
        </button>
      </div>
    </label>
  );
}

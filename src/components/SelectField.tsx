"use client";

import type { SelectHTMLAttributes } from "react";
import { Icon } from "@/components/Icon";

const BASE =
  "w-full min-w-0 appearance-none rounded-2xl border border-[#ebebeb] bg-white py-3 pl-4 pr-11 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 disabled:opacity-60";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  /** Variante compacte (ex. préfixe téléphone). */
  compact?: boolean;
};

/** Menu déroulant stylé + responsive (chevron custom, touch-friendly). */
export function SelectField({
  className = "",
  compact = false,
  children,
  ...props
}: Props) {
  return (
    <div className={`relative min-w-0 ${compact ? "w-auto" : "w-full"}`}>
      <select
        {...props}
        className={[
          BASE,
          compact ? "w-[5.25rem] pl-3 pr-9 font-mono" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </select>
      <span
        className={`pointer-events-none absolute top-1/2 z-[1] -translate-y-1/2 text-zinc-400 ${
          compact ? "right-2.5" : "right-3.5"
        }`}
        aria-hidden
      >
        <Icon name="chevron" className="h-4 w-4" />
      </span>
    </div>
  );
}

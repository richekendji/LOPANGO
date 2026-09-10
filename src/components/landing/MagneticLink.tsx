"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost" | "onDark";
};

const variants: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "bg-zinc-900 text-white hover:bg-zinc-800 after:bg-zinc-800",
  secondary:
    "bg-white text-zinc-900 hover:bg-zinc-100 after:bg-zinc-100",
  ghost:
    "bg-transparent text-zinc-700 hover:bg-zinc-100 after:bg-zinc-100",
  onDark:
    "bg-white text-zinc-900 hover:bg-zinc-100 after:bg-zinc-100",
};

/** CTA avec scale + couche glissante. */
export function MagneticLink({
  variant = "primary",
  className = "",
  children,
  ...props
}: Props) {
  return (
    <Link
      {...props}
      className={[
        "group relative inline-flex items-center justify-center overflow-hidden rounded-full px-5 py-3 text-sm font-semibold transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-px hover:scale-[1.03]",
        variants[variant],
        className,
      ].join(" ")}
    >
      <span className="relative z-10">{children}</span>
    </Link>
  );
}

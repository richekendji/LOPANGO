"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost" | "onDark";
};

const variants: Record<NonNullable<Props["variant"]>, string> = {
  primary: "bg-zinc-900 text-white hover:bg-zinc-800 after:bg-zinc-800",
  secondary: "bg-white text-zinc-900 hover:bg-zinc-100 after:bg-zinc-100",
  ghost: "bg-transparent text-zinc-700 hover:bg-zinc-100 after:bg-zinc-100",
  onDark: "bg-white text-zinc-900 hover:bg-zinc-100 after:bg-zinc-100",
};

function hrefToString(href: Props["href"]): string | null {
  if (typeof href === "string") return href;
  if (href && typeof href === "object" && "pathname" in href) {
    return href.pathname ?? null;
  }
  return null;
}

/** CTA avec scale + navigation dès le doigt / clic. */
export function MagneticLink({
  variant = "primary",
  className = "",
  children,
  href,
  ...props
}: Props) {
  const router = useRouter();
  const path = hrefToString(href);

  return (
    <Link
      href={href}
      prefetch
      {...props}
      onPointerDown={(e) => {
        props.onPointerDown?.(e);
        if (e.defaultPrevented) return;
        if (e.button !== 0 || !path || !path.startsWith("/")) return;
        router.prefetch(path);
      }}
      className={[
        "group relative inline-flex items-center justify-center overflow-hidden rounded-full px-5 py-3 text-sm font-semibold transition-transform duration-150 ease-out hover:-translate-y-px",
        variants[variant],
        className,
      ].join(" ")}
    >
      <span className="relative z-10">{children}</span>
    </Link>
  );
}

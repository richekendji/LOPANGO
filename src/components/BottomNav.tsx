"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Barre de navigation inférieure style app mobile (Feed, Search, Saved...).
 * Toujours visible en bas de l'écran sur la page /app.
 */
const ITEMS = [
  { href: "/app", label: "Feed", icon: "🏠" },
  { href: "/app/search", label: "Search", icon: "🔍" },
  { href: "/app/saved", label: "Saved", icon: "🤍" },
  { href: "/app/inbox", label: "Inbox", icon: "💬" },
  { href: "/dashboard", label: "Profile", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-1">
        {ITEMS.map((item) => {
          const active =
            item.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-14 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[11px] font-medium ${
                active
                  ? "text-emerald-600"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

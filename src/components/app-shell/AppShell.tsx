"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_ITEMS } from "@/lib/mock/dashboard";
import { Icon } from "@/components/Icon";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <Icon name={item.icon} className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-black text-white">
        L
      </span>
      <div className="leading-tight">
        <p className="text-sm font-bold tracking-tight text-zinc-900">LOPANGO</p>
        <p className="text-xs text-zinc-500">Espace vendeur</p>
      </div>
    </Link>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden h-full w-[var(--sidebar-width)] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] lg:flex">
      <Brand />
      <NavLinks />
      <div className="mt-auto border-t border-[var(--border)] p-4">
        <div className="rounded-2xl bg-zinc-50 p-3">
          <p className="text-xs font-medium text-zinc-500">Connecté en tant que</p>
          <p className="mt-1 text-sm font-semibold text-zinc-900">Jean Dupont</p>
          <p className="text-xs text-zinc-500">Propriétaire</p>
        </div>
      </div>
    </aside>
  );
}

export function AppShellHeader({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Ouvrir le menu"
          onClick={onMenu}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-zinc-700 lg:hidden"
        >
          <Icon name="menu" />
        </button>
        <Link
          href="/dashboard"
          className="truncate text-sm font-black tracking-tight text-zinc-900 lg:hidden"
        >
          LOPANGO
        </Link>
      </div>

      <button
        type="button"
        aria-label="Notifications"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-zinc-700"
      >
        <Icon name="bell" />
      </button>
    </header>
  );
}

export function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Fermer le menu"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 left-0 flex w-[min(100%,20rem)] flex-col bg-[var(--surface)] shadow-xl">
        <div className="flex items-center justify-between pr-3">
          <Brand />
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)]"
          >
            <Icon name="close" />
          </button>
        </div>
        <NavLinks onNavigate={onClose} />
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <AppSidebar />
      <MobileDrawer open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppShellHeader onMenu={() => setOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

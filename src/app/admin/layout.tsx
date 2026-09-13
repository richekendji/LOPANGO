import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-zinc-900">
      <header className="sticky top-0 z-40 bg-[#f5f5f5]/95 px-4 pb-2.5 pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link href="/admin" className="text-lg font-black tracking-tight">
            LOPANGO
          </Link>
          <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Admin
          </span>
        </div>
      </header>
      <div className="mx-auto max-w-lg px-4 pb-16">{children}</div>
    </div>
  );
}

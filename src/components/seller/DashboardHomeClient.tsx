"use client";

import Link from "next/link";
import { SellerShell } from "@/components/seller/SellerShell";

export function DashboardHomeClient() {
  return (
    <SellerShell title="Espace vendeur" backHref="/app">
      <div className="space-y-4">
        <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
          <h1 className="text-xl font-bold text-zinc-900">Bonjour 👋</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Gérez vos annonces et les demandes des locataires.
          </p>
        </div>
        <Link
          href="/dashboard/houses"
          className="block rounded-[1.5rem] bg-white p-5 font-semibold text-zinc-900 shadow-sm"
        >
          Mes annonces →
        </Link>
        <Link
          href="/dashboard/houses/new"
          className="block rounded-[1.5rem] bg-zinc-900 p-5 text-center font-semibold text-white shadow-sm"
        >
          + Publier une maison
        </Link>
        <Link
          href="/app/inbox"
          className="block rounded-[1.5rem] bg-white p-5 font-semibold text-zinc-900 shadow-sm"
        >
          Réclamation →
        </Link>
      </div>
    </SellerShell>
  );
}
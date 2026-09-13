import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUser } from "@/lib/admin";
import {
  formatAdminAmount,
  formatAdminDateTime,
  formatAdminPhone,
  roleLabel,
} from "@/lib/admin-format";

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAdminUser(id);
  if (!user) notFound();

  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0) || ""}`.toUpperCase();

  const rows: { label: string; value: string }[] = [
    { label: "Prénom", value: user.firstName },
    { label: "Nom", value: user.lastName || "—" },
    { label: "Numéro", value: formatAdminPhone(user.phone) },
    { label: "Email", value: user.email || "—" },
    { label: "Rôle", value: roleLabel(user.role) },
    { label: "Inscription", value: formatAdminDateTime(user.createdAt) },
    { label: "Abonnement", value: user.paid ? "Actif — payé" : "Non payé" },
    { label: "Début abo", value: formatAdminDateTime(user.startsAt) },
    { label: "Fin abo", value: formatAdminDateTime(user.expiresAt) },
    { label: "Montant", value: formatAdminAmount(user.amount) },
    { label: "Paiement", value: user.paymentMethod || "—" },
    { label: "Transaction", value: user.transactionId || "—" },
  ];

  return (
    <div className="space-y-4">
      <Link
        href="/admin"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ebebeb] bg-white text-lg font-bold text-zinc-900 shadow-sm"
        aria-label="Retour"
      >
        ‹
      </Link>

      <div className="rounded-2xl bg-white px-4 py-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-lg font-bold text-white">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-zinc-900">
              {user.fullName}
            </p>
            <p className="font-mono text-xs text-zinc-500">
              {formatAdminPhone(user.phone)}
            </p>
            <span
              className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                user.paid
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-[#f5f5f5] text-zinc-600"
              }`}
            >
              {user.paid ? "Payé" : "Non payé"}
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-start justify-between gap-4 px-4 py-3 ${
              i < rows.length - 1 ? "border-b border-[#ebebeb]" : ""
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              {row.label}
            </p>
            <p className="max-w-[60%] text-right text-sm font-medium break-all text-zinc-900">
              {row.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

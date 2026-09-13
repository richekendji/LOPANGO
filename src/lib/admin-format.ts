import { displayNormalizedPhone, normalizePhone } from "@/lib/phone";
import { formatFcfa } from "@/lib/mock/houses";

export function formatAdminDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatAdminDateTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatAdminPhone(phone: string | null) {
  if (!phone) return "—";
  const n = normalizePhone(phone);
  return n ? displayNormalizedPhone(n) : phone;
}

export function formatAdminAmount(amount: number | null) {
  if (amount == null) return "—";
  return formatFcfa(amount);
}

export function roleLabel(role: string | null) {
  if (role === "owner") return "Propriétaire";
  if (role === "tenant") return "Locataire";
  return role || "—";
}

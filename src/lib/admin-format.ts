import { displayNormalizedPhone, normalizePhone } from "@/lib/phone";

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

export function roleLabel(role: string | null) {
  if (role === "owner") return "Propriétaire";
  if (role === "tenant") return "Locataire";
  return role || "—";
}

export function roleHint(role: string | null) {
  if (role === "owner") return "Publie des maisons à louer";
  if (role === "tenant") return "Cherche une maison";
  return "Rôle non renseigné";
}

export function accessLabel(paid: boolean) {
  return paid ? "Abonné" : "Gratuit";
}

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { normalizePhone } from "@/lib/phone";

export type AdminUserRow = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  role: string | null;
  createdAt: string | null;
  /** Abonnement payé encore valable. Sinon : gratuit. */
  paid: boolean;
  expiresAt: string | null;
};

function adminPhones(): Set<string> {
  return new Set(
    (process.env.ADMIN_PHONES ?? "")
      .split(",")
      .map((p) => normalizePhone(p.trim()))
      .filter((p): p is string => Boolean(p)),
  );
}

export function isAdminPhone(phone: string | null | undefined): boolean {
  const n = phone ? normalizePhone(phone) : null;
  return Boolean(n && adminPhones().has(n));
}

/** L'utilisateur connecté est-il l'admin (numéro ADMIN_PHONES) ?
 * Il publie et consulte tout sans abonnement.
 */
export async function isAdminUser(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("phone")
      .eq("id", user.id)
      .maybeSingle();
    return isAdminPhone(profile?.phone);
  } catch {
    return false;
  }
}

/** Après connexion / inscription : même flux, destination selon le numéro. */
export function postLoginPath(phone: string | null | undefined): string {
  return isAdminPhone(phone) ? "/admin" : "/app";
}

export async function currentUserHomePath(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const metaPhone =
      typeof user.user_metadata?.phone === "string"
        ? user.user_metadata.phone
        : null;

    try {
      const admin = createAdminClient();
      const { data: profile } = await admin
        .from("profiles")
        .select("phone")
        .eq("id", user.id)
        .maybeSingle();
      // Source de vérité : la table profiles. metaPhone sert uniquement
      // de repli d'affichage si la DB est momentanément indisponible.
      return postLoginPath(profile?.phone ?? metaPhone);
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

function isPaidRow(sub: {
  status?: string | null;
  expires_at?: string | null;
} | null) {
  if (!sub || sub.status !== "active" || !sub.expires_at) return false;
  return new Date(sub.expires_at).getTime() > Date.now();
}

function splitName(fullName: string | null | undefined) {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "—", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/admin");
  }

  const metaPhone =
    typeof user.user_metadata?.phone === "string"
      ? user.user_metadata.phone
      : null;

  try {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("phone")
      .eq("id", user.id)
      .maybeSingle();

    // Décision d'autorisation UNIQUEMENT sur la table profiles (RLS,
    // téléphone non modifiable par l'utilisateur — cf. policy UPDATE).
    // user_metadata est modifiable par l'utilisateur : jamais utilisé ici.
    if (!isAdminPhone(profile?.phone)) {
      redirect("/app");
    }

    return { user, profilePhone: profile?.phone ?? null };
  } catch {
    redirect("/app");
  }
}

async function authCreatedAtMap() {
  const admin = createAdminClient();
  const map = new Map<string, string>();
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) break;
    for (const u of data.users) {
      if (u.created_at) map.set(u.id, u.created_at);
    }
    if (data.users.length < 200) break;
    page += 1;
  }
  return map;
}

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const admin = createAdminClient();
  const [{ data: profiles }, { data: subs }, created] = await Promise.all([
    admin
      .from("profiles")
      .select("id, email, full_name, phone, role")
      .order("full_name", { ascending: true }),
    admin
      .from("subscriptions")
      .select("user_id, status, expires_at"),
    authCreatedAtMap(),
  ]);

  const subByUser = new Map<
    string,
    { status: string | null; expires_at: string | null }
  >();
  for (const s of subs ?? []) {
    const current = subByUser.get(s.user_id);
    const nextExp = s.expires_at ? new Date(s.expires_at).getTime() : 0;
    const curExp = current?.expires_at
      ? new Date(current.expires_at).getTime()
      : 0;
    if (!current || nextExp >= curExp) {
      subByUser.set(s.user_id, s);
    }
  }

  return (profiles ?? []).map((p) => {
    const names = splitName(p.full_name);
    const sub = subByUser.get(p.id) ?? null;
    return {
      id: p.id,
      firstName: names.firstName,
      lastName: names.lastName,
      fullName:
        p.full_name?.trim() || `${names.firstName} ${names.lastName}`.trim(),
      phone: p.phone,
      email: p.email,
      role: p.role,
      createdAt: created.get(p.id) ?? null,
      paid: isPaidRow(sub),
      expiresAt: sub?.expires_at ?? null,
    };
  });
}

export async function getAdminUser(id: string): Promise<AdminUserRow | null> {
  const users = await getAdminUsers();
  return users.find((u) => u.id === id) ?? null;
}

export function adminStats(users: AdminUserRow[]) {
  const tenants = users.filter((u) => u.role === "tenant").length;
  const owners = users.filter((u) => u.role === "owner").length;
  const paid = users.filter((u) => u.paid).length;
  return {
    total: users.length,
    tenants,
    owners,
    paid,
    free: users.length - paid,
  };
}

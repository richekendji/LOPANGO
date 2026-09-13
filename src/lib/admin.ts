import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { normalizePhone } from "@/lib/phone";

/** Compte admin LOPANGO — 06 616 49 98 */
export const ADMIN_PHONE = "066164998";

export type AdminUserRow = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  role: string | null;
  createdAt: string | null;
};

function adminPhones(): Set<string> {
  const extra = (process.env.ADMIN_PHONES ?? "")
    .split(",")
    .map((p) => normalizePhone(p.trim()))
    .filter((p): p is string => Boolean(p));
  return new Set([ADMIN_PHONE, ...extra]);
}

export function isAdminPhone(phone: string | null | undefined): boolean {
  const n = phone ? normalizePhone(phone) : null;
  return Boolean(n && adminPhones().has(n));
}

/** Après connexion / inscription : même flux, destination selon le numéro. */
export function postLoginPath(phone: string | null | undefined): string {
  return isAdminPhone(phone) ? "/admin" : "/app";
}

export async function currentUserHomePath(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("phone")
    .eq("id", user.id)
    .maybeSingle();

  const metaPhone =
    typeof user.user_metadata?.phone === "string"
      ? user.user_metadata.phone
      : null;

  return postLoginPath(profile?.phone ?? metaPhone);
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

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("phone")
    .eq("id", user.id)
    .maybeSingle();

  const metaPhone =
    typeof user.user_metadata?.phone === "string"
      ? user.user_metadata.phone
      : null;

  if (!isAdminPhone(profile?.phone) && !isAdminPhone(metaPhone)) {
    redirect("/app");
  }

  return { user, profilePhone: profile?.phone ?? metaPhone ?? null };
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
  const [{ data: profiles }, created] = await Promise.all([
    admin
      .from("profiles")
      .select("id, email, full_name, phone, role")
      .order("full_name", { ascending: true }),
    authCreatedAtMap(),
  ]);

  return (profiles ?? []).map((p) => {
    const names = splitName(p.full_name);
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
  return {
    total: users.length,
    tenants,
    owners,
  };
}

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { saveRecoveryEmail } from "@/app/actions/auth";

const ERRORS: Record<string, string> = {
  "invalid-email": "Adresse email invalide.",
  config: "Configuration serveur incomplète.",
  "save-failed": "Enregistrement impossible. Réessaie.",
};

/**
 * Carte « Email de récupération » — c'est lui qui reçoit les liens
 * « mot de passe oublié ». Sans lui, la réinitialisation est impossible.
 */
export async function RecoveryEmailCard({
  saved,
  error,
}: {
  saved?: string;
  error?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .maybeSingle();
  const email = profile?.email ?? null;

  const field =
    "w-full rounded-2xl border border-[#ebebeb] bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400";

  return (
    <div className="mt-3 space-y-3 rounded-2xl bg-white px-4 py-4 shadow-sm">
      <div>
        <p className="text-sm font-bold text-zinc-900">
          Email de récupération
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">
          Sert à recevoir le lien « mot de passe oublié ».
        </p>
      </div>

      {!email && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          ⚠️ Aucun email enregistré : en cas de mot de passe oublié, tu ne
          pourras pas récupérer ton compte.
        </p>
      )}

      {saved === "email" && (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-700">
          Email de récupération enregistré ✅
        </p>
      )}
      {error && ERRORS[error] && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-700">
          {ERRORS[error]}
        </p>
      )}

      <form action={saveRecoveryEmail} className="flex gap-2">
        <input
          name="email"
          type="email"
          required
          defaultValue={email ?? ""}
          placeholder="tu@email.com"
          className={field}
        />
        <button
          type="submit"
          className="shrink-0 rounded-2xl bg-zinc-900 px-4 text-sm font-semibold text-white"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
}

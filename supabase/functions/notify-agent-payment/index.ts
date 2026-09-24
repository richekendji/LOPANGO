// deno-lint-ignore-file no-explicit-any
// Edge Function : envoi de l'email « paiement reçu » au démarcheur.
// Appelée uniquement par le backend LOPANGO (clé service_role).
// Provider : Resend (RESEND_API_KEY) ou Brevo (BREVO_API_KEY).

const MAIL_FROM = Deno.env.get("MAIL_FROM") ?? "";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

const AGENT_COMMISSION = 4500;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  // Auth : seule la service_role peut appeler (fail-closed si non configurée)
  const auth = req.headers.get("authorization") ?? "";
  const apiKey = req.headers.get("apikey") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!serviceKey) {
    return json({ ok: false, error: "server_not_configured" }, 503);
  }
  if (!auth.includes(serviceKey) && !apiKey.includes(serviceKey)) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  if (!MAIL_FROM) {
    return json({ ok: false, error: "mail_from_not_configured" }, 503);
  }

  let body: {
    to?: string;
    agentLabel?: string;
    amount?: number;
    houseTitle?: string;
    period?: string;
  };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const to = (body.to ?? "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    return json({ ok: false, error: "invalid_email" }, 400);
  }

  const amount = Number(body.amount ?? AGENT_COMMISSION).toLocaleString("fr-FR");
  const label = escapeHtml(body.agentLabel?.trim() || "Démarcheur");
  const period = body.period === "annuel" ? "annuel" : "mensuel";
  const house = escapeHtml(body.houseTitle?.trim() ?? "");

  const html = `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
  <h2 style="color:#111">💰 Paiement reçu — commission LOPANGO</h2>
  <p>Bonjour <strong>${label}</strong>,</p>
  <p>Un abonnement a été payé via l'une de tes annonces :</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr><td style="padding:8px;background:#f5f5f5">Montant de la commission</td>
    <td style="padding:8px;background:#f5f5f5;text-align:right"><strong>{amount} FCFA</strong></td></tr>
    <tr><td style="padding:8px">Abonnement</td><td style="padding:8px;text-align:right">${period}</td></tr>
    ${house ? `<tr><td style="padding:8px;background:#f5f5f5">Annonce</td><td style="padding:8px;background:#f5f5f5;text-align:right">${house}</td></tr>` : ""}
  </table>
  <p>Le montant est ajouté à ton solde retirable dans l'app LOPANGO.</p>
  <p style="color:#888;font-size:12px">LOPANGO — Louez la maison en ligne</p>
</div>`;

  try {
    // SMTP client natif n'existe pas dans Deno runtime standard :
    // on passe par l'API Resend si configurée, sinon erreur claire.
    const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";
    if (resendKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: MAIL_FROM,
          to: [to],
          subject: `💰 Commission de ${amount} FCFA reçue — LOPANGO`,
          html,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        return json({ ok: false, error: `resend_${res.status}`, detail: t }, 502);
      }
      return json({ ok: true, via: "resend" });
    }

    // Fallback : envoi via SMTP gateway HTTP (Brevo/Sendinblue)
    const brevoKey = Deno.env.get("BREVO_API_KEY") ?? "";
    if (brevoKey) {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { email: MAIL_FROM, name: "LOPANGO" },
          to: [{ email: to }],
          subject: `💰 Commission de ${amount} FCFA reçue — LOPANGO`,
          htmlContent: html,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        return json({ ok: false, error: `brevo_${res.status}`, detail: t }, 502);
      }
      return json({ ok: true, via: "brevo" });
    }

    return json(
      { ok: false, error: "no_provider", hint: "Set RESEND_API_KEY or BREVO_API_KEY" },
      503,
    );
  } catch (err) {
    return json(
      { ok: false, error: err instanceof Error ? err.message : "send_failed" },
      500,
    );
  }
});

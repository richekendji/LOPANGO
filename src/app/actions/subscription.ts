"use server";

import { createClient } from "@/lib/supabase/server";
import { getSebPay } from "@/lib/sebpay";
import { SUBSCRIPTION_PRICES, SUBSCRIPTION_DURATION_DAYS } from "@/lib/pricing";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSubscription(formData: FormData) {
  const role = formData.get("role") === "owner" ? "owner" : "tenant";
  const phone = String(formData.get("phone") ?? "");
  const method = String(formData.get("method") ?? "MTN");

  if (!phone) {
    redirect(`/subscribe?role=${role}&error=missing-phone`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const amount = SUBSCRIPTION_PRICES[role];
  const externalRef = `lopango_${user.id.slice(0, 8)}_${Date.now()}`;

  // Enregistre la souscription en attente
  const { data: subscription, error: insertError } = await supabase
    .from("subscriptions")
    .insert({
      user_id: user.id,
      role,
      amount,
      status: "pending",
      payment_method: method,
      transaction_id: externalRef,
    })
    .select("id")
    .single();

  if (insertError) {
    redirect(`/subscribe?role=${role}&error=${encodeURIComponent(insertError.message)}`);
  }

  // Initie le paiement SebPay
  try {
    const sebpay = getSebPay();
    const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/webhooks/sebpay`;

    const payment = await sebpay.create({
      amount,
      currency: "XOF",
      phone: phone.replace(/[^0-9]/g, ""),
      operator: method === "MTN" ? "mtn" : "airtel",
      country: "CG",
      externalRef,
      callbackUrl,
    });

    // Met à jour la souscription avec l'ID de transaction SebPay
    if (payment.transaction_id) {
      await supabase
        .from("subscriptions")
        .update({ transaction_id: payment.transaction_id })
        .eq("id", subscription.id);
    }

    revalidatePath("/dashboard");

    // Si SebPay renvoie un lien de redirection (ex: Wave), on y va
    if (payment.provider_link) {
      redirect(payment.provider_link);
    }

    redirect(`/subscribe/pending?ref=${encodeURIComponent(externalRef)}&role=${role}`);
  } catch (error) {
    console.error("Erreur SebPay:", error);
    redirect(`/subscribe?role=${role}&error=${encodeURIComponent("Impossible de lancer le paiement. Vérifiez que les clés SebPay sont configurées.")}`);
  }
}
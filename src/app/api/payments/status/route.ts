import { NextResponse } from "next/server";
import { getSebPay } from "@/lib/sebpay";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref");
  if (!ref) {
    return NextResponse.json({ error: "ref manquant" }, { status: 400 });
  }

  try {
    const sebpay = getSebPay();
    const tx = await sebpay.getTransaction(ref);
    const status = String(tx.status ?? "pending").toLowerCase();
    return NextResponse.json({
      status,
      approved: status === "approved" || status === "success" || status === "paid",
      rejected: status === "rejected" || status === "failed",
      transactionId: tx.transaction_id ?? null,
      raw: tx,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Impossible de vérifier le paiement.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

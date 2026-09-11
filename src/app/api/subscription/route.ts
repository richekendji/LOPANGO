import { NextResponse } from "next/server";
import { getSessionSubscriptionActive } from "@/lib/subscription";

export async function GET() {
  try {
    const active = await getSessionSubscriptionActive();
    return NextResponse.json({ active });
  } catch {
    return NextResponse.json({ active: false });
  }
}

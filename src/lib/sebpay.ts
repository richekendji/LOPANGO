import crypto from "crypto";

/**
 * Client SebPay v2 — conforme à la doc officielle (new.sebpay.bj/fr/docs).
 *
 * - Base URL : https://newapi.sebpay.bj/api/v1
 * - Auth     : headers X-Public-Key (pk_...) + X-Secret-Key (sk_...)
 * - Réponses : enveloppe { success, data, message }
 * - Erreurs  : enveloppe { success: false, message } avec code HTTP != 2xx
 */
const DEFAULT_BASE_URL = "https://newapi.sebpay.bj/api/v1";

type SebPayConfig = {
  publicKey: string;
  secretKey: string;
  baseUrl: string;
};

export type InitiateCollectionParams = {
  amount: number;
  currency: string;
  /** Téléphone international, sans le + (ex: 24206xxxxxxx) */
  phone: string;
  /** Slug opérateur : mtn, moov, orange, airtel… */
  operator: string;
  /** Code pays ISO : CG, CD… */
  country: string;
  externalRef: string;
  callbackUrl: string;
  otpCode?: string;
};

export type SebPayCollection = {
  transaction_id?: string;
  status?: string;
  message?: string;
  otp_required?: boolean;
  redirect_url?: string;
  [key: string]: unknown;
};

/** Enveloppe commune des réponses SebPay v2. */
type SebPayEnvelope = {
  success?: boolean;
  data?: SebPayCollection;
  message?: string;
};

export class SebPay {
  private config: SebPayConfig;

  constructor(config: SebPayConfig) {
    this.config = config;
  }

  private headers() {
    return {
      "Content-Type": "application/json",
      "X-Public-Key": this.config.publicKey,
      "X-Secret-Key": this.config.secretKey,
    };
  }

  /** Déballe l'enveloppe { success, data, message } ; lève en cas d'échec. */
  private async unwrap(
    res: Response,
    context: string,
  ): Promise<SebPayCollection> {
    const text = await res.text();
    let json: SebPayEnvelope = {};
    try {
      json = text ? (JSON.parse(text) as SebPayEnvelope) : {};
    } catch {
      if (!res.ok) {
        throw new Error(
          `SebPay ${context} HTTP ${res.status}: ${text.slice(0, 300)}`,
        );
      }
      return {};
    }

    if (!res.ok || json.success === false) {
      throw new Error(
        `SebPay ${context} HTTP ${res.status}: ${json.message ?? text.slice(0, 300)}`,
      );
    }

    // Certains retours peuvent être plats (sans data) — on tolère les deux.
    return (json.data ?? (json as unknown as SebPayCollection)) as SebPayCollection;
  }

  async create(p: InitiateCollectionParams): Promise<SebPayCollection> {
    const body = {
      amount: p.amount,
      currency: p.currency,
      phone: p.phone,
      operator: p.operator,
      country: p.country,
      external_reference: p.externalRef,
      callback_url: p.callbackUrl,
      ...(p.otpCode ? { otp_code: p.otpCode } : {}),
    };

    const res = await fetch(`${this.config.baseUrl}/collections`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
    });

    return this.unwrap(res, "collections");
  }

  async getTransaction(idOrRef: string): Promise<SebPayCollection> {
    const res = await fetch(
      `${this.config.baseUrl}/collections/${encodeURIComponent(idOrRef)}`,
      { headers: this.headers(), signal: AbortSignal.timeout(20_000) },
    );
    return this.unwrap(res, "collections/get");
  }

  async getOperators(country?: string): Promise<unknown> {
    const url = country
      ? `${this.config.baseUrl}/operators?country=${encodeURIComponent(country)}`
      : `${this.config.baseUrl}/operators`;
    const res = await fetch(url, {
      headers: this.headers(),
      signal: AbortSignal.timeout(20_000),
    });
    return this.unwrap(res, "operators");
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const received = signature.startsWith("sha256=")
      ? signature.slice(7)
      : signature;
    const expected = crypto
      .createHmac("sha256", this.config.secretKey)
      .update(payload)
      .digest("hex");
    try {
      if (received.length !== expected.length) return false;
      return crypto.timingSafeEqual(
        Buffer.from(received, "hex"),
        Buffer.from(expected, "hex"),
      );
    } catch {
      return false;
    }
  }
}

export function getSebPay() {
  const publicKey = process.env.SEBPAY_PUBLIC_KEY;
  const secretKey = process.env.SEBPAY_SECRET_KEY;
  const baseUrl =
    process.env.SEBPAY_BASE_URL?.replace(/\/$/, "") || DEFAULT_BASE_URL;

  if (!publicKey || !secretKey) {
    throw new Error(
      "Clés SebPay manquantes (SEBPAY_PUBLIC_KEY / SEBPAY_SECRET_KEY)",
    );
  }

  return new SebPay({ publicKey, secretKey, baseUrl });
}

/** Normalise un numéro Congo vers 242XXXXXXXXX (sans +). */
export function normalizeCongoPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("242")) return digits;
  if (digits.startsWith("0")) return `242${digits.slice(1)}`;
  if (digits.length === 9) return `242${digits}`;
  return digits;
}

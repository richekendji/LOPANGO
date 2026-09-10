import crypto from "crypto";

const DEFAULT_BASE_URL = "https://api.sebpay.com";

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
  /** Slug opérateur : mtn, airtel, orange… */
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
  ussd_code?: string;
  [key: string]: unknown;
};

export class SebPay {
  private config: SebPayConfig;

  constructor(config: SebPayConfig) {
    this.config = config;
  }

  private headers() {
    return {
      "Content-Type": "application/json",
      "X-API-Key": this.config.publicKey,
      "X-Secret-Key": this.config.secretKey,
    };
  }

  async create(p: InitiateCollectionParams): Promise<SebPayCollection> {
    const body = {
      amount: p.amount,
      currency: p.currency,
      phone: p.phone,
      operator: p.operator,
      country: p.country,
      external_ref: p.externalRef,
      callback_url: p.callbackUrl,
      ...(p.otpCode ? { otp_code: p.otpCode } : {}),
    };

    const res = await fetch(`${this.config.baseUrl}/collections`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let json: SebPayCollection = {};
    try {
      json = text ? (JSON.parse(text) as SebPayCollection) : {};
    } catch {
      throw new Error(`SebPay API ${res.status}: ${text.slice(0, 300)}`);
    }

    if (!res.ok) {
      throw new Error(
        `SebPay API ${res.status}: ${json.message ?? text.slice(0, 300)}`,
      );
    }

    return json;
  }

  async getTransaction(idOrRef: string): Promise<SebPayCollection> {
    const res = await fetch(
      `${this.config.baseUrl}/collections/${encodeURIComponent(idOrRef)}`,
      { headers: this.headers() },
    );
    const text = await res.text();
    let json: SebPayCollection = {};
    try {
      json = text ? (JSON.parse(text) as SebPayCollection) : {};
    } catch {
      throw new Error(`SebPay API ${res.status}: ${text.slice(0, 300)}`);
    }
    if (!res.ok) {
      throw new Error(
        `SebPay API ${res.status}: ${json.message ?? text.slice(0, 300)}`,
      );
    }
    return json;
  }

  async getOperators(country?: string): Promise<unknown> {
    const url = country
      ? `${this.config.baseUrl}/operators?country=${encodeURIComponent(country)}`
      : `${this.config.baseUrl}/operators`;
    const res = await fetch(url, { headers: this.headers() });
    if (!res.ok) throw new Error(`SebPay API error ${res.status}`);
    return res.json();
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
    throw new Error("Clés SebPay manquantes (SEBPAY_PUBLIC_KEY / SEBPAY_SECRET_KEY)");
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

import crypto from "crypto";

const SEBPAY_BASE_URL = "https://api.sebpay.com"; // À adapter selon la doc

interface SebPayConfig {
  publicKey: string;
  secretKey: string;
  baseUrl?: string;
}

interface InitiateCollectionParams {
  amount: number;
  currency: string;
  phone: string; // Format international sans le +
  operator: string; // Slug : mtn, moov, orange...
  country: string; // Code ISO : CG, BJ, CI...
  externalRef: string;
  callbackUrl: string;
  otpCode?: string;
}

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

  /** Initie une demande de paiement Mobile Money */
  async create(p: InitiateCollectionParams) {
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

    const res = await fetch(`${this.config.baseUrl ?? SEBPAY_BASE_URL}/collections`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`SebPay API error ${res.status}: ${text}`);
    }

    return res.json();
  }

  /** Récupère le statut d'une transaction */
  async getTransaction(idOrRef: string) {
    const res = await fetch(
      `${this.config.baseUrl ?? SEBPAY_BASE_URL}/collections/${idOrRef}`,
      { headers: this.headers() },
    );
    if (!res.ok) throw new Error(`SebPay API error ${res.status}`);
    return res.json();
  }

  /** Liste des opérateurs disponibles (pour vérifier OTP requis) */
  async getOperators(country?: string) {
    const url = country
      ? `${this.config.baseUrl ?? SEBPAY_BASE_URL}/operators?country=${country}`
      : `${this.config.baseUrl ?? SEBPAY_BASE_URL}/operators`;
    const res = await fetch(url, { headers: this.headers() });
    if (!res.ok) throw new Error(`SebPay API error ${res.status}`);
    return res.json();
  }

  /** Vérifie la signature HMAC d'un webhook */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expected = crypto
      .createHmac("sha256", this.config.secretKey)
      .update(payload)
      .digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex"),
    );
  }
}

/** Crée un client SebPay à partir des variables d'environnement */
export function getSebPay() {
  const publicKey = process.env.SEBPAY_PUBLIC_KEY;
  const secretKey = process.env.SEBPAY_SECRET_KEY;

  if (!publicKey || !secretKey) {
    throw new Error("Les clés SebPay ne sont pas configurées dans .env.local");
  }

  return new SebPay({
    publicKey,
    secretKey,
    baseUrl: process.env.SEBPAY_BASE_URL,
  });
}
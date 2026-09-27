import {
  DeleteObjectCommand,
  PutBucketCorsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { networkInterfaces } from "node:os";

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Variable manquante: ${name}`);
  return v;
}

export function getR2Bucket() {
  return requireEnv("R2_BUCKET_NAME");
}

export function getR2PublicBase() {
  return requireEnv("NEXT_PUBLIC_R2_PUBLIC_URL").replace(/\/$/, "");
}

let client: S3Client | null = null;
let corsReady = false;

export function getR2Client() {
  if (client) return client;
  client = new S3Client({
    region: "auto",
    endpoint: requireEnv("R2_ENDPOINT"),
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
    // Le SDK AWS ajoute par défaut un checksum CRC32 (x-amz-checksum-crc32)
    // non supporté par Cloudflare R2 (501). On le désactive : R2 a son propre
    // contrôle d'intégrité (etatag) et n'exige pas ce header.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return client;
}

/** IPs LAN (192.168.x.x, 10.x…) pour tester l'upload depuis le téléphone. */
function localLanOrigins(): string[] {
  if (process.env.VERCEL || process.env.NODE_ENV === "production") return [];
  const out: string[] = [];
  for (const list of Object.values(networkInterfaces())) {
    for (const ni of list ?? []) {
      if (ni.family === "IPv4" && !ni.internal) {
        out.push(`http://${ni.address}:3000`);
      }
    }
  }
  return out;
}

/** Autorise PUT depuis le site (local + Vercel) pour les uploads navigateur. */
export async function ensureR2Cors() {
  if (corsReady) return;
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";
  const vercelHost = process.env.VERCEL_URL?.replace(/^https?:\/\//, "");
  const origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...localLanOrigins(),
    site,
    vercelHost ? `https://${vercelHost}` : "",
    "https://lopango.site",
    "https://www.lopango.site",
  ].filter(Boolean);
  const unique = Array.from(new Set(origins));

  await getR2Client().send(
    new PutBucketCorsCommand({
      Bucket: getR2Bucket(),
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: unique,
            AllowedMethods: ["GET", "PUT", "HEAD"],
            AllowedHeaders: ["*"],
            ExposeHeaders: ["ETag", "Content-Length"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    }),
  );
  corsReady = true;
}

export async function createR2UploadUrl(params: {
  key: string;
  contentType: string;
}) {
  // La config CORS persiste dans le bucket : un échec ne doit JAMAIS
  // empêcher de signer l'URL (sinon upload bloqué à chaque cold start).
  try {
    await ensureR2Cors();
  } catch (err) {
    console.error(
      "[r2] échec de l'application CORS (non bloquant):",
      err instanceof Error ? err.message : err,
    );
  }
  const command = new PutObjectCommand({
    Bucket: getR2Bucket(),
    Key: params.key,
    ContentType: params.contentType,
  });
  const uploadUrl = await getSignedUrl(getR2Client(), command, {
    expiresIn: 60 * 15,
  });
  const publicUrl = `${getR2PublicBase()}/${params.key}`;
  return { uploadUrl, publicUrl };
}

export async function deleteR2Object(key: string) {
  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: getR2Bucket(),
      Key: key,
    }),
  );
}

export function publicUrlToR2Key(url: string): string | null {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!base || !url.startsWith(base + "/")) return null;
  return decodeURIComponent(url.slice(base.length + 1));
}

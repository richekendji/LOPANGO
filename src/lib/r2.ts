import {
  DeleteObjectCommand,
  PutBucketCorsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
  });
  return client;
}

/** Autorise PUT depuis le site (local + Vercel) pour les uploads navigateur. */
export async function ensureR2Cors() {
  if (corsReady) return;
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";
  const origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    site,
    "https://lopango.site",
    "https://www.lopango.site",
    "https://lopango-lovat.vercel.app",
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
  await ensureR2Cors();
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

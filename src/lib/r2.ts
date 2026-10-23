import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutBucketCorsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { networkInterfaces } from "node:os";

function requireEnv(name: string): string {
  // Vercel peut stocker la valeur avec des guillemets ou espaces résiduels :
  // on nettoie pour obtenir la clé « nue » attendue par R2 (ex. 32 chars).
  let v = process.env[name] ?? "";
  v = v.trim();
  if ((v.startsWith("\"") && v.endsWith("\"")) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim();
  }
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
  const rawUrl = await getSignedUrl(getR2Client(), command, {
    expiresIn: 60 * 15,
    // "content-type" doit être signé : sinon le navigateur
    // envoie Content-Type non couvert et la signature R2
    // échoue (401).
    signableHeaders: new Set(["host", "content-type"]),
  });
  // Le SDK ajoute x-amz-checksum-* dans l'URL sign�e, mais R2
  // v�rifie le checksum contre le corps r�el et renvoie 401 si
  // mismatch (le corps envoy� ne correspond pas au checksum vide
  // sign�). On les retire : R2 utilise son propre contr�le
  // d'int�grit� (etag).
  const uploadUrl = rawUrl.replace(/&x-amz-checksum-(crc32|sha256)=[^&]*/g, "").replace(/&x-amz-sdk-checksum-algorithm=[^&]*/g, "");
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

/** Convertit une URL publique R2 en clé d'objet (ou null si externe). */
export function publicUrlToR2Key(url: string): string | null {
  const base = getR2PublicBase();
  if (!url.startsWith(base + "/")) return null;
  return decodeURIComponent(url.slice(base.length + 1));
}

/**
 * Supprime de R2 une liste d'URLs publiques (photos + vidéos).
 * Les URLs externes / non-R2 sont ignorées. Suppression par lots de 1000.
 * Idempotent : supprimer une clé absente ne lève pas d'erreur.
 * Retourne le nombre d'objets traités.
 */
export async function deleteR2Objects(urls: string[]): Promise<number> {
  const keys = Array.from(
    new Set(
      urls
        .map((u) => publicUrlToR2Key(u))
        .filter((k): k is string => Boolean(k)),
    ),
  );
  if (keys.length === 0) return 0;

  const client = getR2Client();
  const bucket = getR2Bucket();
  let count = 0;

  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000);
    try {
      await client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
        }),
      );
      count += batch.length;
    } catch (err) {
      // Repli objet par objet pour ne pas perdre tout le lot.
      console.error(
        "[r2] delete batch failed, fallback:",
        err instanceof Error ? err.message : err,
      );
      for (const Key of batch) {
        try {
          await client.send(new DeleteObjectCommand({ Bucket: bucket, Key }));
          count += 1;
        } catch (e) {
          console.error(
            "[r2] delete failed:",
            Key,
            e instanceof Error ? e.message : e,
          );
        }
      }
    }
  }
  return count;
}

/** Liste toutes les clés du bucket (pagination). */
export async function listAllR2Keys(): Promise<string[]> {
  const client = getR2Client();
  const bucket = getR2Bucket();
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const res = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: token,
      }),
    );
    for (const obj of res.Contents ?? []) {
      if (obj.Key) keys.push(obj.Key);
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

/** Vide entièrement le bucket R2. Retourne le nombre d'objets supprimés. */
export async function emptyR2Bucket(): Promise<number> {
  const keys = await listAllR2Keys();
  if (keys.length === 0) return 0;

  const client = getR2Client();
  const bucket = getR2Bucket();
  let count = 0;
  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000);
    await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
      }),
    );
    count += batch.length;
  }
  return count;
}

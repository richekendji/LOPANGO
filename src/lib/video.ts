/** Limites UX (alignées avec l’API / R2). */
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200 Mo
export const MAX_VIDEO_SECONDS = 10 * 60; // 10 minutes

const IDB_PREFIX = "idb:video:";
const DB_NAME = "lopango_media_v1";
const STORE = "videos";

export function isIdbVideoRef(src: string) {
  return src.startsWith(IDB_PREFIX);
}

export function isR2VideoUrl(src: string) {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");
  return Boolean(base && src.startsWith(base));
}

export function isSupabaseVideoUrl(src: string) {
  return src.includes("/storage/v1/object/public/listing-videos/");
}

export function isVideoRef(src: string) {
  return (
    isIdbVideoRef(src) ||
    isR2VideoUrl(src) ||
    isSupabaseVideoUrl(src) ||
    /\.(mp4|webm|mov|m4v)(\?|$)/i.test(src) ||
    src.startsWith("blob:") ||
    /^https?:\/\//i.test(src)
  );
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB impossible"));
  });
}

/** URL lisible par <video> (R2 / http / legacy IndexedDB). */
export async function resolveVideoUrl(ref: string): Promise<string | null> {
  if (!ref) return null;
  if (!isIdbVideoRef(ref)) return ref;

  try {
    const db = await openDb();
    const blob = await new Promise<Blob | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(ref);
      req.onsuccess = () => resolve(req.result as Blob | undefined);
      req.onerror = () =>
        reject(req.error ?? new Error("Lecture vidéo impossible"));
    });
    db.close();
    if (!blob) return null;
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export async function deleteVideoBlob(ref: string): Promise<void> {
  if (isIdbVideoRef(ref)) {
    try {
      const db = await openDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).delete(ref);
        tx.oncomplete = () => resolve();
        tx.onerror = () =>
          reject(tx.error ?? new Error("Suppression impossible"));
      });
      db.close();
    } catch {
      /* ignore */
    }
    return;
  }

  if (!isR2VideoUrl(ref) && !ref.includes("r2.dev")) return;

  try {
    await fetch(`/api/videos?url=${encodeURIComponent(ref)}`, {
      method: "DELETE",
    });
  } catch {
    /* ignore */
  }
}

function extFromFile(file: File) {
  const m = file.name.match(/\.\w+$/);
  if (m) return m[0].toLowerCase();
  if (file.type === "video/webm") return ".webm";
  if (file.type === "video/quicktime") return ".mov";
  return ".mp4";
}

function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement("video");
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      const d = el.duration;
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(d) ? d : 0);
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Impossible de lire la durée de la vidéo."));
    };
    el.src = url;
  });
}

function uploadWithProgress(
  uploadUrl: string,
  file: File,
  onProgress?: (message: string) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type || "video/mp4");

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const pct = Math.min(99, Math.round((e.loaded / e.total) * 100));
      onProgress?.(`Envoi vers Cloudflare R2… ${pct}%`);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      reject(
        new Error(
          `Échec upload R2 (${xhr.status}). Vérifie CORS du bucket et les clés.`,
        ),
      );
    };
    xhr.onerror = () =>
      reject(new Error("Erreur réseau pendant l’upload R2."));
    xhr.send(file);
  });
}

type ProgressCb = (message: string) => void;

/**
 * Upload une vidéo vers Cloudflare R2 (URL publique).
 * Nom conservé pour le formulaire existant.
 */
export async function compressAndStoreVideo(
  file: File,
  onProgress?: ProgressCb,
): Promise<string> {
  if (!file.type.startsWith("video/")) {
    throw new Error("Seuls les fichiers vidéo sont acceptés.");
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error(
      "Vidéo trop lourde (max 200 Mo). Réduis la qualité ou la durée.",
    );
  }

  onProgress?.("Analyse de la vidéo…");
  try {
    const duration = await readVideoDuration(file);
    if (duration > MAX_VIDEO_SECONDS) {
      throw new Error("Vidéo trop longue (max 10 minutes).");
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("trop longue")) throw err;
  }

  onProgress?.("Préparation de l’upload…");
  const res = await fetch("/api/videos/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentType: file.type || "video/mp4",
      fileName: file.name || `video${extFromFile(file)}`,
      size: file.size,
    }),
  });

  const data = (await res.json()) as {
    ok?: boolean;
    error?: string;
    uploadUrl?: string;
    publicUrl?: string;
  };

  if (!res.ok || !data.ok || !data.uploadUrl || !data.publicUrl) {
    throw new Error(data.error || "Impossible de préparer l’upload R2.");
  }

  await uploadWithProgress(data.uploadUrl, file, onProgress);
  onProgress?.("Vidéo enregistrée sur Cloudflare.");
  return data.publicUrl;
}

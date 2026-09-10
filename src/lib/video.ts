import { newId } from "@/lib/mock/houses";

const DB_NAME = "lopango_media_v1";
const STORE = "videos";
const REF_PREFIX = "idb:video:";

export function isVideoRef(src: string) {
  return src.startsWith(REF_PREFIX) || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(src);
}

export function isIdbVideoRef(src: string) {
  return src.startsWith(REF_PREFIX);
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

export async function saveVideoBlob(blob: Blob): Promise<string> {
  const id = newId("vid");
  const key = `${REF_PREFIX}${id}`;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Écriture vidéo impossible"));
  });
  db.close();
  return key;
}

export async function deleteVideoBlob(ref: string): Promise<void> {
  if (!isIdbVideoRef(ref)) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(ref);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Suppression impossible"));
  });
  db.close();
}

/** URL lisible par <video> (blob: ou URL distante). */
export async function resolveVideoUrl(ref: string): Promise<string | null> {
  if (!ref) return null;
  if (!isIdbVideoRef(ref)) return ref;

  const db = await openDb();
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(ref);
    req.onsuccess = () => resolve(req.result as Blob | undefined);
    req.onerror = () => reject(req.error ?? new Error("Lecture vidéo impossible"));
  });
  db.close();
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

type ProgressCb = (message: string) => void;

/**
 * Compresse une vidéo via ffmpeg.wasm (max ~20s, largeur ≤ 720).
 * Fallback : fichier d’origine si FFmpeg échoue (dans la limite de taille).
 */
export async function compressAndStoreVideo(
  file: File,
  onProgress?: ProgressCb,
): Promise<string> {
  const MAX_INPUT_BYTES = 80 * 1024 * 1024; // 80 Mo
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("Vidéo trop lourde (max 80 Mo). Choisis un fichier plus court.");
  }

  onProgress?.("Chargement de FFmpeg…");

  try {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { fetchFile, toBlobURL } = await import("@ffmpeg/util");

    const ffmpeg = new FFmpeg();
    ffmpeg.on("log", () => {});
    ffmpeg.on("progress", ({ progress }) => {
      const pct = Math.min(99, Math.round((progress || 0) * 100));
      onProgress?.(`Compression… ${pct}%`);
    });

    const baseURL =
      "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm",
      ),
    });

    const inputName = "input" + (file.name.match(/\.\w+$/)?.[0] || ".mp4");
    const outputName = "output.mp4";

    onProgress?.("Préparation de la vidéo…");
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    onProgress?.("Compression en cours…");
    await ffmpeg.exec([
      "-i",
      inputName,
      "-t",
      "20",
      "-vf",
      "scale='min(720,iw)':-2",
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-crf",
      "32",
      "-movflags",
      "+faststart",
      "-an",
      outputName,
    ]);

    const data = await ffmpeg.readFile(outputName);
    const bytes =
      data instanceof Uint8Array
        ? data
        : new TextEncoder().encode(String(data));
    // Copy into a plain ArrayBuffer-backed view for Blob compatibility
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    const blob = new Blob([copy], { type: "video/mp4" });

    onProgress?.("Enregistrement…");
    const ref = await saveVideoBlob(blob);

    try {
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch {
      /* ignore cleanup */
    }

    return ref;
  } catch (err) {
    // Fallback sans FFmpeg : stocke le fichier brut (plafonné)
    const FALLBACK_MAX = 25 * 1024 * 1024;
    if (file.size > FALLBACK_MAX) {
      throw new Error(
        err instanceof Error
          ? `Compression impossible et fichier trop lourd (${err.message}).`
          : "Compression impossible et fichier trop lourd.",
      );
    }
    onProgress?.("Compression indisponible — enregistrement direct…");
    return saveVideoBlob(file);
  }
}

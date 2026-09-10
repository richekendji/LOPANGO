/** Convertit un fichier image en data URL JPEG compressée (persistante en localStorage). */
export function fileToPersistentUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Lecture impossible"));
    reader.onload = () => {
      const raw = reader.result as string;
      const img = new Image();
      img.onerror = () => resolve(raw);
      img.onload = () => {
        const max = 1200;
        let { width, height } = img;
        if (width > max || height > max) {
          const ratio = Math.min(max / width, max / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(raw);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = raw;
    };
    reader.readAsDataURL(file);
  });
}

export function isLocalImageUrl(src: string) {
  return src.startsWith("blob:") || src.startsWith("data:");
}

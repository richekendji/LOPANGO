import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "LOPANGO";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const bytes = await readFile(join(process.cwd(), "public/brand/logo.jpg"));
  const src = `data:image/jpeg;base64,${bytes.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <img src={src} width={520} height={520} alt="" />
      </div>
    ),
    { ...size },
  );
}

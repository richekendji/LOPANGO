import { ImageResponse } from "next/og";

export const alt = "LOPANGO - Location de maisons au Congo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#18181b",
          color: "#fafafa",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 6,
            fontWeight: 700,
            opacity: 0.7,
          }}
        >
          CONGO
        </div>
        <div style={{ fontSize: 88, fontWeight: 900, letterSpacing: -2 }}>
          LOPANGO
        </div>
        <div style={{ marginTop: 18, fontSize: 32, maxWidth: 820, lineHeight: 1.3 }}>
          Location de maisons — contact direct propriétaire ↔ locataire
        </div>
      </div>
    ),
    { ...size },
  );
}

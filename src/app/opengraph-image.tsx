import { ImageResponse } from "next/og";

export const alt = "LOPANGO — Louer est facile";
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
        <svg
          width="92"
          height="74"
          viewBox="0 0 100 80"
          fill="none"
          style={{ marginBottom: 28 }}
        >
          <path
            d="M18 38 L50 8 L82 38"
            stroke="#fafafa"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="miter"
          />
          <path
            d="M28 42 V72 H70 V54"
            stroke="#fafafa"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="miter"
          />
        </svg>
        <div style={{ fontSize: 80, fontWeight: 900, letterSpacing: -2 }}>
          LOPANGO
        </div>
        <div style={{ marginTop: 10, fontSize: 28, opacity: 0.7 }}>
          Louer est facile
        </div>
        <div
          style={{
            marginTop: 22,
            fontSize: 28,
            maxWidth: 820,
            lineHeight: 1.35,
            opacity: 0.85,
          }}
        >
          Maisons à louer au Congo — contact direct, sans démarcheur
        </div>
      </div>
    ),
    { ...size },
  );
}

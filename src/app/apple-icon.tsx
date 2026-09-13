import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#18181b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="118" height="94" viewBox="0 0 100 80" fill="none">
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
      </div>
    ),
    { ...size },
  );
}

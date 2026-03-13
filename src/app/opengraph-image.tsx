import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Rhymee - 日本語韻検索エンジン";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: 120,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.02em",
          }}
        >
          Rhyme
          <span style={{ color: "#c4b5fd" }}>e</span>
        </div>
        <div
          style={{
            fontSize: 36,
            color: "rgba(255,255,255,0.8)",
            marginTop: 16,
          }}
        >
          日本語の韻を見つけよう
        </div>
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 48,
            fontSize: 20,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <span>母音パターン検索</span>
          <span>・</span>
          <span>スコアリング</span>
          <span>・</span>
          <span>パブリックAPI</span>
        </div>
      </div>
    ),
    { ...size }
  );
}

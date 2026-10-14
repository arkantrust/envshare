import { ImageResponse } from "next/og";

export const alt = "EnvShare: share environment variables securely";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// No `runtime` export: this is rendered once at build time and served as a static asset.
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        backgroundColor: "#0a0a0a",
        backgroundImage:
          "radial-gradient(ellipse at 50% 0%, rgba(246,130,31,.35), rgba(10,10,10,0) 60%)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#f6821f" }} />
        <div style={{ fontSize: 40, fontWeight: 700 }}>EnvShare</div>
      </div>
      <div
        style={{
          fontSize: 80,
          fontWeight: 800,
          lineHeight: 1.1,
          padding: "0 120px",
          letterSpacing: -2,
        }}
      >
        Share environment variables securely
      </div>
      <div style={{ marginTop: 32, fontSize: 32, color: "#f6821f" }}>
        Encrypted in your browser. Deleted after reading.
      </div>
    </div>,
    size,
  );
}

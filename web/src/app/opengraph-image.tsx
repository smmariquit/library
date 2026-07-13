import { ImageResponse } from "next/og";

export const alt = "Personal Library — your books, ready when you are";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(135deg, #171412 0%, #292017 55%, #9a3412 140%)",
        color: "#fffdf8",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        padding: "80px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: "940px", width: "100%" }}>
        <div style={{ color: "#fbbf24", display: "flex", fontSize: 24, fontWeight: 700, letterSpacing: 6 }}>
          PERSONAL LIBRARY
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 700, letterSpacing: -3, lineHeight: 1.05, marginTop: 28 }}>
          Your books, ready when you are.
        </div>
        <div style={{ color: "#d6d3d1", display: "flex", fontSize: 30, lineHeight: 1.4, marginTop: 28 }}>
          Upload, organize, and read your PDFs in one quiet shelf.
        </div>
      </div>
    </div>,
    size,
  );
}

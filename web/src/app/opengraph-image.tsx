import { ImageResponse } from "next/og";

export const alt = "Personal Library. Your books, ready when you are.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const mark = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#9a3412"/><g transform="translate(5 5) scale(0.9167)" fill="none" stroke="#fbf3e7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></g></svg>`;
const markSrc = `data:image/svg+xml;base64,${Buffer.from(mark).toString("base64")}`;

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#1c1917",
        color: "#fffdf8",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "80px",
        width: "100%",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <div style={{ alignItems: "center", display: "flex", gap: 20 }}>
        <img src={markSrc} width={72} height={72} alt="" />
        <div style={{ display: "flex", fontSize: 30, fontWeight: 600 }}>Personal Library</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: "960px" }}>
        <div style={{ display: "flex", fontFamily: "Georgia, serif", fontSize: 80, letterSpacing: -2, lineHeight: 1.05 }}>
          Your books, ready when you are.
        </div>
        <div style={{ color: "#a8a29e", display: "flex", fontSize: 30, lineHeight: 1.4, marginTop: 28 }}>
          Upload, organize, and read your PDFs in one quiet shelf.
        </div>
      </div>
    </div>,
    size,
  );
}

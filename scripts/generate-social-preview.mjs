import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "../web/node_modules/next/og.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, ".github", "social-preview.png");

const mark = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#9a3412"/><g transform="translate(5 5) scale(0.9167)" fill="none" stroke="#fbf3e7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></g></svg>`;
const markSrc = `data:image/svg+xml;base64,${Buffer.from(mark).toString("base64")}`;

const image = new ImageResponse(
  {
    type: "div",
    props: {
      style: {
        background: "#1c1917",
        color: "#fffdf8",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "80px",
        width: "100%",
      },
      children: [
        {
          type: "div",
          props: {
            style: { alignItems: "center", display: "flex", gap: 20 },
            children: [
              { type: "img", props: { src: markSrc, width: 72, height: 72 } },
              {
                type: "div",
                props: {
                  style: { display: "flex", fontSize: 30, fontWeight: 600 },
                  children: "Personal Library",
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column", maxWidth: "960px" },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    fontFamily: "Georgia, serif",
                    fontSize: 80,
                    letterSpacing: -2,
                    lineHeight: 1.05,
                  },
                  children: "Your books, ready when you are.",
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    color: "#a8a29e",
                    display: "flex",
                    fontSize: 30,
                    lineHeight: 1.4,
                    marginTop: 28,
                  },
                  children: "Upload, organize, and read your PDFs in one quiet shelf.",
                },
              },
            ],
          },
        },
      ],
    },
  },
  { width: 1280, height: 640 },
);

mkdirSync(dirname(outPath), { recursive: true });
const buffer = Buffer.from(await image.arrayBuffer());
writeFileSync(outPath, buffer);
console.log(`Wrote ${outPath} (${buffer.length} bytes)`);

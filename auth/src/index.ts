import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { Hono } from "hono";
import { auth } from "../auth.js";

const app = new Hono();

app.use(
  "/api/auth/*",
  cors({
    origin: process.env.WEB_URL ?? "http://localhost:3000",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  }),
);

app.get("/health", (c) => c.json({ status: "ok" }));
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

serve({ fetch: app.fetch, port: 3001, hostname: "0.0.0.0" });

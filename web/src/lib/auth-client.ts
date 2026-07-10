"use client";

import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL ?? "http://localhost:3001",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [jwtClient()],
});

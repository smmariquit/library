import { authClient } from "@/lib/auth-client";

const apiURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Book = {
  id: string;
  title: string;
  author: string;
  description: string | null;
  reading_status: "unread" | "reading" | "finished";
  created_at: string;
  updated_at: string;
};

function send(path: string, token: string, init: RequestInit) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return fetch(`${apiURL}${path}`, { ...init, headers });
}

export async function api(path: string, token: string, init: RequestInit = {}) {
  let response: Response;
  try {
    response = await send(path, token, init);
    if (response.status === 401) {
      // The JWT is short-lived and held only in client memory. On expiry, re-mint
      // one from the still-valid auth session cookie and retry once, so a long-idle
      // page saves instead of surfacing a raw "Invalid bearer token".
      const fresh = await authClient
        .token()
        .then((result) => result.data?.token ?? null)
        .catch(() => null);
      if (fresh && fresh !== token) response = await send(path, fresh, init);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new Error("The library service is unavailable. Please try again.");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? "Something went wrong. Please try again.");
  }
  return response;
}

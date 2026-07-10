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

export async function api(path: string, token: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${apiURL}${path}`, { ...init, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? "Something went wrong. Please try again.");
  }
  return response;
}

"use client";

import { useCallback, useEffect, useState } from "react";

type MailLinkStatus = "waiting" | "ready" | "timeout" | "error";

function delay(signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    let timeout = 0;
    const finish = () => {
      window.clearTimeout(timeout);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    timeout = window.setTimeout(finish, 1000);
    signal.addEventListener("abort", finish, { once: true });
  });
}

export function useDevMailLink(endpoint: string, email: string) {
  const requestKey = `${endpoint}:${email}`;
  const [result, setResult] = useState<{ key: string; status: MailLinkStatus; url: string }>({
    key: requestKey,
    status: email ? "waiting" : "error",
    url: "",
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!email) return;

    const controller = new AbortController();

    async function poll() {
      for (let index = 0; index < 30; index += 1) {
        if (controller.signal.aborted) return;

        try {
          const response = await fetch(`${endpoint}?email=${encodeURIComponent(email)}`, {
            signal: controller.signal,
          });
          if (!response.ok) {
            setResult({ key: requestKey, status: "error", url: "" });
            return;
          }

          const data = (await response.json()) as { found?: boolean; url?: string };
          if (data.found && data.url) {
            setResult({ key: requestKey, status: "ready", url: data.url });
            return;
          }
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setResult({ key: requestKey, status: "error", url: "" });
          return;
        }

        await delay(controller.signal);
      }

      if (!controller.signal.aborted) setResult({ key: requestKey, status: "timeout", url: "" });
    }

    void poll();
    return () => controller.abort();
  }, [attempt, email, endpoint, requestKey]);

  const retry = useCallback(() => {
    setResult({ key: requestKey, status: email ? "waiting" : "error", url: "" });
    setAttempt((value) => value + 1);
  }, [email, requestKey]);

  return result.key === requestKey
    ? { retry, status: result.status, url: result.url }
    : { retry, status: email ? "waiting" as const : "error" as const, url: "" };
}

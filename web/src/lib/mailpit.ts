const DEFAULT_WEB_URL = "http://localhost:3000";
const MAILPIT_URL = process.env.MAILPIT_URL ?? "http://localhost:8025";

type MailpitAddress = { Address: string };
type MailpitMessage = { ID: string; Subject: string; To: MailpitAddress[] };

export function extractLinkFromText(text: string) {
  const match = text.match(/https?:\/\/[^\s"'<>]+/);
  return match?.[0].replaceAll("&amp;", "&") ?? null;
}

export function toWebVerificationLink(rawUrl: string, webURL = process.env.WEB_URL ?? DEFAULT_WEB_URL) {
  const parsed = new URL(rawUrl);
  const token = parsed.searchParams.get("token");
  if (!token) {
    return null;
  }

  return `${webURL}/verify?token=${encodeURIComponent(token)}`;
}

async function findMessageBody(email: string, subject: string) {
  const normalizedEmail = email.trim().toLowerCase();

  let messages: { messages?: MailpitMessage[] };
  try {
    const response = await fetch(`${MAILPIT_URL}/api/v1/messages`, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    messages = await response.json();
  } catch {
    return null;
  }

  const message = messages.messages?.find(
    (item) =>
      item.Subject === subject &&
      item.To.some((to) => to.Address.toLowerCase() === normalizedEmail),
  );
  if (!message) {
    return null;
  }

  try {
    const response = await fetch(`${MAILPIT_URL}/api/v1/message/${message.ID}`, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    const detail = (await response.json()) as { Text?: string; HTML?: string };
    return detail.Text ?? detail.HTML ?? null;
  } catch {
    return null;
  }
}

export async function findRawMailLink(email: string, subject: string) {
  const body = await findMessageBody(email, subject);
  if (!body) {
    return null;
  }

  return extractLinkFromText(body);
}

export async function findVerificationLink(email: string, subject: string, webURL = process.env.WEB_URL ?? DEFAULT_WEB_URL) {
  const rawLink = await findRawMailLink(email, subject);
  if (!rawLink) {
    return null;
  }

  return toWebVerificationLink(rawLink, webURL);
}

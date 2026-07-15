const webURL = process.env.WEB_URL ?? "http://localhost:3000";

export function verificationLink(token: string) {
  const params = new URLSearchParams({ token });
  return `${webURL}/verify?${params.toString()}`;
}

export function resetPasswordLink(token: string) {
  const params = new URLSearchParams({ token });
  return `${webURL}/reset-password?${params.toString()}`;
}

export function verificationEmailHtml(url: string) {
  return `
    <p>Thanks for joining Personal Library.</p>
    <p><a href="${url}">Verify your email</a></p>
    <p>If the button does not work, copy this link into your browser:</p>
    <p><a href="${url}">${url}</a></p>
  `.trim();
}

export function verificationEmailText(url: string) {
  return `Verify your Library email by opening this link: ${url}`;
}

export function resetPasswordEmailHtml(url: string) {
  return `
    <p>We received a request to reset your Personal Library password.</p>
    <p><a href="${url}">Reset your password</a></p>
    <p>If the button does not work, copy this link into your browser:</p>
    <p><a href="${url}">${url}</a></p>
  `.trim();
}

export function resetPasswordEmailText(url: string) {
  return `Reset your Library password by opening this link: ${url}`;
}

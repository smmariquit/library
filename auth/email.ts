const webURL = process.env.WEB_URL ?? "http://localhost:3000";

export function verificationLink(token: string) {
  const params = new URLSearchParams({ token });
  return `${webURL}/verify?${params.toString()}`;
}

export function resetPasswordLink(token: string) {
  const params = new URLSearchParams({ token });
  return `${webURL}/reset-password?${params.toString()}`;
}

// Email-safe branded template: table-based layout, inline styles, no external
// assets (images/fonts/CSS are unreliable across mail clients). Warm-paper theme
// matched to the app.
function renderEmail(opts: {
  preheader: string;
  heading: string;
  intro: string;
  buttonLabel: string;
  url: string;
  footNote: string;
}) {
  const { preheader, heading, intro, buttonLabel, url, footNote } = opts;
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f6f1e8;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1e8;">
  <tr><td align="center" style="padding:40px 16px;">
    <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:480px;max-width:100%;">
      <tr><td style="padding:0 4px 20px;font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:bold;color:#1c1917;">
        Personal Library
      </td></tr>
      <tr><td style="background:#fffdf8;border:1px solid #e7e0d4;border-radius:12px;padding:36px;">
        <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:normal;color:#1c1917;">${heading}</h1>
        <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#57534e;">${intro}</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 4px;">
          <tr><td style="border-radius:8px;background:#1c1917;">
            <a href="${url}" style="display:inline-block;padding:13px 26px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#fffdf8;text-decoration:none;border-radius:8px;">${buttonLabel}</a>
          </td></tr>
        </table>
        <p style="margin:24px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#78716c;">
          Or paste this link into your browser:<br>
          <a href="${url}" style="color:#9a3412;word-break:break-all;">${url}</a>
        </p>
      </td></tr>
      <tr><td style="padding:20px 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#a8a29e;">
        ${footNote}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export function verificationEmailHtml(url: string) {
  return renderEmail({
    preheader: "Confirm your email to finish setting up Personal Library.",
    heading: "Confirm your email",
    intro: "Thanks for joining Personal Library. Confirm your email address to activate your account and start building your shelf.",
    buttonLabel: "Verify email",
    url,
    footNote: "You received this because someone signed up with this address. If it wasn't you, you can safely ignore this email.",
  });
}

export function verificationEmailText(url: string) {
  return `Confirm your email to finish setting up Personal Library.\n\nVerify your email by opening this link:\n${url}\n\nIf you didn't sign up, you can ignore this message.`;
}

export function resetPasswordEmailHtml(url: string) {
  return renderEmail({
    preheader: "Reset your Personal Library password.",
    heading: "Reset your password",
    intro: "We received a request to reset your Personal Library password. Choose a new one using the link below. The link expires shortly for your security.",
    buttonLabel: "Reset password",
    url,
    footNote: "If you didn't request a password reset, you can safely ignore this email. Your password will stay the same.",
  });
}

export function resetPasswordEmailText(url: string) {
  return `Reset your Personal Library password.\n\nChoose a new password by opening this link:\n${url}\n\nIf you didn't request this, you can ignore this message.`;
}

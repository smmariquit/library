import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import nodemailer from "nodemailer";
import { Pool } from "pg";
import {
  verificationEmailHtml,
  verificationEmailText,
  verificationLink,
} from "./email.js";

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3001";
const webURL = process.env.WEB_URL ?? "http://localhost:3000";

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "mailpit",
  port: Number(process.env.SMTP_PORT ?? 1025),
  secure: false,
});

async function sendMail(to: string, subject: string, text: string, html: string) {
  await mailer.sendMail({
    from: process.env.SMTP_FROM ?? "no-reply@library.local",
    to,
    subject,
    text,
    html,
  });
}

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [webURL],
  database: new Pool({
    connectionString: process.env.AUTH_DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) =>
      sendMail(
        user.email,
        "Reset your Library password",
        `Reset your password: ${url}`,
        `<p><a href="${url}">Reset your Library password</a></p><p>${url}</p>`,
      ),
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const url = verificationLink(token);
      void sendMail(
        user.email,
        "Verify your Library email",
        verificationEmailText(url),
        verificationEmailHtml(url),
      );
    },
  },
  plugins: [jwt()],
});

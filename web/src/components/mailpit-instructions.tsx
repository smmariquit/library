"use client";

import { Alert } from "@/components/ui";

const MAILPIT_URL = "http://localhost:8025";

type MailpitInstructionsProps = {
  email: string;
  subject: string;
  lead: string;
};

export function MailpitInstructions({ email, subject, lead }: MailpitInstructionsProps) {
  return (
    <div className="mt-6 grid gap-4">
      <Alert tone="waiting">{lead}</Alert>
      <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-muted">
        <li>
          Open{" "}
          <a
            href={MAILPIT_URL}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-strong underline decoration-stone-300 underline-offset-4"
          >
            Mailpit
          </a>{" "}
          at {MAILPIT_URL}.
        </li>
        <li>
          Find the message titled <span className="font-medium text-strong">{subject}</span>
          {email ? ` sent to ${email}` : ""}.
        </li>
        <li>Click the link in that email to continue in this app.</li>
      </ol>
    </div>
  );
}

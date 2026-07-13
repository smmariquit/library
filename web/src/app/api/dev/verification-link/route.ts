import { NextRequest, NextResponse } from "next/server";
import { findVerificationLink } from "@/lib/mailpit";

const VERIFY_SUBJECT = "Verify your Library email";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const url = await findVerificationLink(email, VERIFY_SUBJECT);
  if (!url) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({ found: true, url });
}

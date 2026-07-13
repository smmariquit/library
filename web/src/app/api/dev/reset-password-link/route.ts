import { NextRequest, NextResponse } from "next/server";
import { findRawMailLink } from "@/lib/mailpit";

const RESET_SUBJECT = "Reset your Library password";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const url = await findRawMailLink(email, RESET_SUBJECT);
  if (!url) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({ found: true, url });
}

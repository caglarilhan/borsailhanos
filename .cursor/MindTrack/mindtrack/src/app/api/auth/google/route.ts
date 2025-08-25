import { NextRequest, NextResponse } from "next/server";
import { getTokensFromCode } from "@/lib/google-calendar";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/?error=google_auth_failed", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  try {
    await getTokensFromCode(code);
    
    // TODO: Store tokens securely (encrypted in Supabase)
    // For now, redirect with success
    return NextResponse.redirect(new URL("/?success=google_connected", request.url));
  } catch (err) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(new URL("/?error=token_exchange_failed", request.url));
  }
}

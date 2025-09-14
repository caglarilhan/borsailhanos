import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseClient";
import { exchangeCodeForTokens } from "@/lib/google-oauth-storage";

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
    // Get current user
    const supabase = createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.redirect(new URL("/?error=unauthorized", request.url));
    }

    // Exchange code for tokens and store them securely
    const result = await exchangeCodeForTokens(user.id, code);
    
    if (!result.success) {
      console.error("Failed to exchange code for tokens:", result.error);
      return NextResponse.redirect(new URL("/?error=token_exchange_failed", request.url));
    }

    console.log("Google OAuth tokens stored successfully for user:", user.id);
    return NextResponse.redirect(new URL("/?success=google_connected", request.url));
    
  } catch (err) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(new URL("/?error=token_exchange_failed", request.url));
  }
}

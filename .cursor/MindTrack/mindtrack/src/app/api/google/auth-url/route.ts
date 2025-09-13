import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAuthUrl, getGoogleTokens, getUserProfile, getGoogleOAuth2Client } from '@/lib/google-calendar';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key'
);

// Get Google authorization URL
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const authUrl = getGoogleAuthUrl();
    
    // Store state parameter for security
    const state = `${userId}_${Date.now()}`;
    
    return NextResponse.json({ 
      authUrl: `${authUrl}&state=${state}`,
      state 
    });
  } catch (error) {
    console.error('Google auth URL error:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}

// Handle Google OAuth callback
export async function POST(request: NextRequest) {
  try {
    const { code, state, userId } = await request.json();

    if (!code || !state || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify state parameter
    const [expectedUserId, timestamp] = state.split('_');
    if (expectedUserId !== userId) {
      return NextResponse.json(
        { error: 'Invalid state parameter' },
        { status: 400 }
      );
    }

    // Exchange code for tokens
    const tokens = await getGoogleTokens(code);
    
    // Get user profile
    const oauth2Client = getGoogleOAuth2Client();
    oauth2Client.setCredentials(tokens);
    const profile = await getUserProfile(oauth2Client);

    // Store tokens in database
    await supabase
      .from('user_google_tokens')
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type,
        expiry_date: tokens.expiry_date,
        scope: tokens.scope,
        google_user_id: profile.id,
        google_email: profile.email,
        google_name: profile.name,
        google_picture: profile.picture,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
      },
    });
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.json(
      { error: 'Failed to process OAuth callback' },
      { status: 500 }
    );
  }
}
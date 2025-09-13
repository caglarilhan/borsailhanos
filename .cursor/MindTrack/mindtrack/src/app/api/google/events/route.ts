import { NextRequest, NextResponse } from 'next/server';
import { 
  getGoogleOAuth2Client, 
  createCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent, 
  listCalendarEvents,
  refreshAccessToken 
} from '@/lib/google-calendar';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key'
);

// Get user's Google tokens
async function getUserTokens(userId: string) {
  const { data, error } = await supabase
    .from('user_google_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new Error('Google tokens not found');
  }

  return data;
}

// Get authenticated Google client
async function getAuthenticatedClient(userId: string) {
  const tokens = await getUserTokens(userId);
  const oauth2Client = getGoogleOAuth2Client();
  
  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_type: tokens.token_type,
    expiry_date: tokens.expiry_date,
  });

  // Check if token is expired and refresh if needed
  if (tokens.expiry_date && new Date(tokens.expiry_date) <= new Date()) {
    try {
      const newTokens = await refreshAccessToken(tokens.refresh_token);
      
      // Update tokens in database
      await supabase
        .from('user_google_tokens')
        .update({
          access_token: newTokens.access_token,
          token_type: newTokens.token_type,
          expiry_date: newTokens.expiry_date,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      oauth2Client.setCredentials(newTokens);
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new Error('Token refresh failed');
    }
  }

  return oauth2Client;
}

// Create calendar event
export async function POST(request: NextRequest) {
  try {
    const { userId, eventData } = await request.json();

    if (!userId || !eventData) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const auth = await getAuthenticatedClient(userId);
    const event = await createCalendarEvent(auth, eventData);

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Create calendar event error:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}

// Update calendar event
export async function PUT(request: NextRequest) {
  try {
    const { userId, eventId, eventData } = await request.json();

    if (!userId || !eventId || !eventData) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const auth = await getAuthenticatedClient(userId);
    const event = await updateCalendarEvent(auth, eventId, eventData);

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Update calendar event error:', error);
    return NextResponse.json(
      { error: 'Failed to update calendar event' },
      { status: 500 }
    );
  }
}

// Delete calendar event
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const eventId = searchParams.get('eventId');

    if (!userId || !eventId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const auth = await getAuthenticatedClient(userId);
    const result = await deleteCalendarEvent(auth, eventId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Delete calendar event error:', error);
    return NextResponse.json(
      { error: 'Failed to delete calendar event' },
      { status: 500 }
    );
  }
}

// List calendar events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const timeMin = searchParams.get('timeMin');
    const timeMax = searchParams.get('timeMax');
    const maxResults = searchParams.get('maxResults');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const auth = await getAuthenticatedClient(userId);
    const events = await listCalendarEvents(auth, {
      timeMin: timeMin || undefined,
      timeMax: timeMax || undefined,
      maxResults: maxResults ? parseInt(maxResults) : undefined,
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('List calendar events error:', error);
    return NextResponse.json(
      { error: 'Failed to list calendar events' },
      { status: 500 }
    );
  }
}

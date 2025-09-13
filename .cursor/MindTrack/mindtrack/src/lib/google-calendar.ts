import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Google Calendar configuration
export const GOOGLE_CALENDAR_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],
};

// Initialize OAuth2 client
export function getGoogleOAuth2Client(): OAuth2Client {
  return new google.auth.OAuth2(
    GOOGLE_CALENDAR_CONFIG.clientId,
    GOOGLE_CALENDAR_CONFIG.clientSecret,
    GOOGLE_CALENDAR_CONFIG.redirectUri
  );
}

// Get Google Calendar API instance
export function getGoogleCalendarAPI(auth: OAuth2Client) {
  return google.calendar({ version: 'v3', auth });
}

// Generate authorization URL
export function getGoogleAuthUrl(): string {
  const oauth2Client = getGoogleOAuth2Client();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_CALENDAR_CONFIG.scopes,
    prompt: 'consent',
  });
}

// Exchange authorization code for tokens
export async function getGoogleTokens(code: string) {
  const oauth2Client = getGoogleOAuth2Client();
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    console.error('Error getting Google tokens:', error);
    throw error;
  }
}

// Create calendar event
export async function createCalendarEvent(
  auth: OAuth2Client,
  eventData: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    attendees?: { email: string }[];
    location?: string;
    conferenceData?: {
      createRequest: {
        requestId: string;
        conferenceSolutionKey: { type: string };
      };
    };
  }
) {
  const calendar = getGoogleCalendarAPI(auth);
  
  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: eventData,
      conferenceDataVersion: eventData.conferenceData ? 1 : 0,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

// Update calendar event
export async function updateCalendarEvent(
  auth: OAuth2Client,
  eventId: string,
  eventData: Partial<{
    summary: string;
    description: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    attendees: { email: string }[];
    location: string;
  }>
) {
  const calendar = getGoogleCalendarAPI(auth);
  
  try {
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      requestBody: eventData,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
}

// Delete calendar event
export async function deleteCalendarEvent(auth: OAuth2Client, eventId: string) {
  const calendar = getGoogleCalendarAPI(auth);
  
  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
}

// List calendar events
export async function listCalendarEvents(
  auth: OAuth2Client,
  options: {
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    singleEvents?: boolean;
    orderBy?: string;
  } = {}
) {
  const calendar = getGoogleCalendarAPI(auth);
  
  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: options.timeMin || new Date().toISOString(),
      timeMax: options.timeMax,
      maxResults: options.maxResults || 10,
      singleEvents: options.singleEvents || true,
      orderBy: options.orderBy || 'startTime',
    });
    
    return response.data.items || [];
  } catch (error) {
    console.error('Error listing calendar events:', error);
    throw error;
  }
}

// Get user profile
export async function getUserProfile(auth: OAuth2Client) {
  const oauth2 = google.oauth2({ version: 'v2', auth });
  
  try {
    const response = await oauth2.userinfo.get();
    return response.data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string) {
  const oauth2Client = getGoogleOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}
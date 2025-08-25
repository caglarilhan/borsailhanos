import { google } from "googleapis";

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
];

export function getGoogleAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Missing Google OAuth credentials");
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function generateAuthUrl() {
  const auth = getGoogleAuthClient();
  return auth.generateAuthUrl({
    access_type: "offline",
    scope: GOOGLE_SCOPES,
    prompt: "consent",
  });
}

export async function getTokensFromCode(code: string) {
  const auth = getGoogleAuthClient();
  const { tokens } = await auth.getToken(code);
  return tokens;
}

export async function createCalendarEvent(
  accessToken: string,
  summary: string,
  startTime: string,
  endTime: string,
  description?: string
) {
  const auth = getGoogleAuthClient();
  auth.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth });
  
  const event = {
    summary,
    description,
    start: { dateTime: startTime, timeZone: "UTC" },
    end: { dateTime: endTime, timeZone: "UTC" },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
  });

  return response.data;
}

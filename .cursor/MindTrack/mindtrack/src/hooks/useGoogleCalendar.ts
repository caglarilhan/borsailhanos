'use client';

import { useState, useEffect } from 'react';

export interface GoogleEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  location?: string;
  conferenceData?: {
    entryPoints: Array<{
      entryPointType: string;
      uri: string;
    }>;
  };
  htmlLink?: string;
  created: string;
  updated: string;
}

export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export function useGoogleCalendar() {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const [profile, setProfile] = useState<GoogleProfile | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Check if user has Google Calendar connected
  const checkConnection = async (userId: string) => {
    try {
      const response = await fetch(`/api/google/events?userId=${userId}`);
      if (response.ok) {
        setIsConnected(true);
        return true;
      } else {
        setIsConnected(false);
        return false;
      }
    } catch (error) {
      console.error('Error checking Google Calendar connection:', error);
      setIsConnected(false);
      return false;
    }
  };

  // Get Google authorization URL
  const getAuthUrl = async (userId: string) => {
    try {
      const response = await fetch(`/api/google/auth-url?userId=${userId}`);
      const data = await response.json();
      return data.authUrl;
    } catch (error) {
      console.error('Error getting Google auth URL:', error);
      throw error;
    }
  };

  // Connect Google Calendar
  const connectCalendar = async (userId: string) => {
    try {
      const authUrl = await getAuthUrl(userId);
      window.open(authUrl, '_blank', 'width=500,height=600');
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      throw error;
    }
  };

  // Handle OAuth callback
  const handleCallback = async (userId: string, code: string, state: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/google/auth-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state, userId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setProfile(data.profile);
        setIsConnected(true);
        return true;
      } else {
        throw new Error(data.error || 'Failed to connect Google Calendar');
      }
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Create calendar event
  const createEvent = async (
    userId: string,
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
  ) => {
    setLoading(true);
    try {
      const response = await fetch('/api/google/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, eventData }),
      });

      const data = await response.json();
      
      if (data.event) {
        // Refresh events list
        await getEvents(userId);
        return data.event;
      } else {
        throw new Error(data.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update calendar event
  const updateEvent = async (
    userId: string,
    eventId: string,
    eventData: Partial<{
      summary: string;
      description: string;
      start: { dateTime: string; timeZone: string };
      end: { dateTime: string; timeZone: string };
      attendees: { email: string }[];
      location: string;
    }>
  ) => {
    setLoading(true);
    try {
      const response = await fetch('/api/google/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, eventId, eventData }),
      });

      const data = await response.json();
      
      if (data.event) {
        // Refresh events list
        await getEvents(userId);
        return data.event;
      } else {
        throw new Error(data.error || 'Failed to update event');
      }
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete calendar event
  const deleteEvent = async (userId: string, eventId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/google/events?userId=${userId}&eventId=${eventId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh events list
        await getEvents(userId);
        return true;
      } else {
        throw new Error(data.error || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get calendar events
  const getEvents = async (
    userId: string,
    options: {
      timeMin?: string;
      timeMax?: string;
      maxResults?: number;
    } = {}
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId,
        ...(options.timeMin && { timeMin: options.timeMin }),
        ...(options.timeMax && { timeMax: options.timeMax }),
        ...(options.maxResults && { maxResults: options.maxResults.toString() }),
      });

      const response = await fetch(`/api/google/events?${params}`);
      const data = await response.json();
      
      if (data.events) {
        setEvents(data.events);
        return data.events;
      } else {
        throw new Error(data.error || 'Failed to get events');
      }
    } catch (error) {
      console.error('Error getting calendar events:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sync appointment with Google Calendar
  const syncAppointment = async (
    userId: string,
    appointment: {
      id: string;
      title: string;
      description?: string;
      startTime: string;
      endTime: string;
      clientEmail?: string;
      location?: string;
      createMeeting?: boolean;
    }
  ) => {
    const eventData = {
      summary: appointment.title,
      description: appointment.description || '',
      start: {
        dateTime: appointment.startTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: appointment.endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: appointment.clientEmail ? [{ email: appointment.clientEmail }] : undefined,
      location: appointment.location,
      conferenceData: appointment.createMeeting ? {
        createRequest: {
          requestId: `meet_${appointment.id}_${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      } : undefined,
    };

    return await createEvent(userId, eventData);
  };

  return {
    loading,
    events,
    profile,
    isConnected,
    checkConnection,
    connectCalendar,
    handleCallback,
    createEvent,
    updateEvent,
    deleteEvent,
    getEvents,
    syncAppointment,
  };
}











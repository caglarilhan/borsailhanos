"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { Calendar, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface CalendarSyncButtonProps {
  userId: string;
  onSyncComplete?: () => void;
}

export default function CalendarSyncButton({ userId, onSyncComplete }: CalendarSyncButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const { 
    isConnected, 
    profile, 
    connectCalendar, 
    checkConnection,
    getEvents 
  } = useGoogleCalendar();

  // Check connection status on mount
  React.useEffect(() => {
    if (userId) {
      checkConnection(userId);
    }
  }, [userId, checkConnection]);

  const handleSync = async () => {
    setLoading(true);
    try {
      await connectCalendar(userId);
      // The OAuth flow will be handled in a popup
      // We'll check the connection status after a delay
      setTimeout(async () => {
        const connected = await checkConnection(userId);
        if (connected && onSyncComplete) {
          onSyncComplete();
        }
      }, 2000);
    } catch (error) {
      console.error("Calendar sync error:", error);
      alert("Failed to start calendar sync");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await getEvents(userId, { maxResults: 10 });
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error) {
      console.error("Calendar refresh error:", error);
      alert("Failed to refresh calendar");
    } finally {
      setLoading(false);
    }
  };

  if (isConnected && profile) {
    return (
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-green-50">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <div className="font-medium text-green-900">Google Calendar Connected</div>
            <div className="text-sm text-green-700">{profile.email}</div>
          </div>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Synced
        </Badge>
        <Button
          onClick={handleRefresh}
          disabled={loading}
          size="sm"
          variant="outline"
          className="ml-auto"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 border rounded-lg bg-blue-50">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-blue-600" />
        <div>
          <div className="font-medium text-blue-900">Connect Google Calendar</div>
          <div className="text-sm text-blue-700">Sync your appointments automatically</div>
        </div>
      </div>
      <Button
        onClick={handleSync}
        disabled={loading}
        size="sm"
        className="ml-auto bg-blue-600 hover:bg-blue-700"
      >
        {loading ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Calendar className="h-4 w-4 mr-2" />
            Connect
          </>
        )}
      </Button>
    </div>
  );
}

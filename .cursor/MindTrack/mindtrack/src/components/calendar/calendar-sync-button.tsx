"use client";

import * as React from "react";
import { generateAuthUrl } from "@/lib/google-calendar";

export default function CalendarSyncButton() {
  const [loading, setLoading] = React.useState(false);

  const handleSync = async () => {
    setLoading(true);
    try {
      const authUrl = generateAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Calendar sync error:", error);
      alert("Failed to start calendar sync");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className="border rounded px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 disabled:opacity-50"
    >
      {loading ? "Connecting..." : "Sync Google Calendar"}
    </button>
  );
}

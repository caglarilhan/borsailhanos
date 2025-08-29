"use client";

import * as React from "react";

export default function CalendarSyncButton() {
  const [loading, setLoading] = React.useState(false);

  const handleSync = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/google/auth-url');
      if (!res.ok) throw new Error('Failed to get auth url');
      const { url } = await res.json();
      window.location.href = url;
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

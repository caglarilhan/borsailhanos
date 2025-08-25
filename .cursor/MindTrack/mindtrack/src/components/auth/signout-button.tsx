"use client";

import * as React from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function SignOutButton() {
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = React.useState(false);
  const onClick = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };
  return (
    <button onClick={onClick} className="text-sm border rounded px-3 py-2" disabled={loading}>
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}



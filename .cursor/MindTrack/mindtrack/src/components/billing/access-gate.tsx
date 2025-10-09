"use client";

import * as React from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

interface AccessGateProps {
  children: React.ReactNode;
}

export function AccessGate({ children }: AccessGateProps) {
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const [active, setActive] = React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const userId = auth.user?.id;
        if (!userId) {
          setActive(false);
          setLoading(false);
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_active, plan")
          .eq("user_id", userId)
          .maybeSingle();
        setActive(!!profile?.is_active);
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

  React.useEffect(() => {
    // LemonSqueezy script
    const existing = document.querySelector('script[src="https://assets.lemonsqueezy.com/lemon.js"]');
    if (!existing) {
      const s = document.createElement('script');
      s.src = 'https://assets.lemonsqueezy.com/lemon.js';
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  if (loading) {
    return <div className="p-6 text-sm text-gray-600">Checking subscription…</div>;
  }

  if (!active) {
    return (
      <div className="border rounded-lg p-6 bg-yellow-50">
        <h3 className="text-lg font-semibold mb-2">Upgrade required</h3>
        <p className="text-gray-700 mb-4">Bu modülü kullanmak için aktif abonelik gerekir.</p>
        <button
          data-lemon-checkout={process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRODUCT_ID || undefined}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-black/90 h-9 px-4"
        >
          Abone Ol
        </button>
      </div>
    );
  }

  return <>{children}</>;
}





"use client";

import * as React from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = React.useState(true);
  const [isAuthed, setIsAuthed] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setIsAuthed(!!data.user);
      setLoading(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session?.user);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  if (loading) return <div className="p-6">Yükleniyor…</div>;
  if (!isAuthed)
    return (
      <div className="max-w-md mx-auto p-6">
        <h2 className="text-xl font-semibold mb-3">Giriş</h2>
        <p className="text-sm text-muted-foreground mb-4">E-mail ile magic link gönderelim.</p>
        <Auth
          supabaseClient={supabase as any}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          view="magic_link"
        />
      </div>
    );
  return <>{children}</>;
}



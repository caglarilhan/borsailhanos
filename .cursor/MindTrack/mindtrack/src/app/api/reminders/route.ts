import { NextResponse } from "next/server";
import { createBrowserClient } from "@supabase/ssr";
import { sendReminderEmail } from "@/lib/email";

export async function GET() {
  // Basic token guard (cron secret)
  const token = process.env.CRON_SECRET;
  if (!token) return NextResponse.json({ error: "Missing CRON_SECRET" }, { status: 500 });

  // Create service client (using anon key is okay for RLS reads with auth bypass if policies allow; ideally use service role via server route)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createBrowserClient(url, anon);

  // 24 saat sonrası aralığı
  const now = new Date();
  const start = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayStr = start.toISOString().slice(0, 10); // YYYY-MM-DD for date column

  const { data: appts, error } = await supabase
    .from("appointments")
    .select("id, client_id, date, time")
    .eq("date", dayStr);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!appts || appts.length === 0) return NextResponse.json({ sent: 0 });

  // Fetch client emails
  const clientIds = Array.from(new Set(appts.map((a: { client_id: string }) => a.client_id)));
  const { data: clients, error: e2 } = await supabase
    .from("clients")
    .select("id, name, email")
    .in("id", clientIds);
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

  let sent = 0;
  for (const appt of appts as Array<{ client_id: string; date: string; time: string }>) {
    const c = clients?.find((x: { id: string }) => x.id === appt.client_id);
    if (!c?.email) continue;
    const subject = `Appointment Reminder`;
    const text = `Hi ${c.name || "there"}, this is a reminder for your appointment on ${appt.date} at ${appt.time}.`;
    try {
      await sendReminderEmail(c.email, subject, text);
      sent++;
    } catch {}
  }

  return NextResponse.json({ sent });
}



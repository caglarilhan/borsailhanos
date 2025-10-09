import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

async function sendEmail(to: string, subject: string, html: string) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM = process.env.RESEND_FROM || 'MindTrack <noreply@mindtrack.app>';
  if (!RESEND_API_KEY) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: FROM, to, subject, html })
  });
}

export async function POST(_request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const now = new Date();
    const target = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const targetDate = target.toISOString().slice(0, 10);

    const { data: appts, error } = await supabase
      .from('appointments')
      .select('id, owner_id, client_id, date, time, tele_link, clients(email, name)')
      .eq('date', targetDate)
      .eq('status', 'scheduled');
    if (error) throw error;

    const list = Array.isArray(appts) ? appts : [];
    for (const a of list as any[]) {
      const email = a.clients?.email;
      if (!email) continue;
      const dt = `${a.date} ${a.time}`;
      const html = `<p>Merhaba ${a.clients?.name || ''},</p><p>Yarın ${dt} tarihinde randevunuz var.</p>${a.tele_link ? `<p>Görüşme linki: <a href="${a.tele_link}">${a.tele_link}</a></p>` : ''}<p>Görüşmek üzere.</p>`;
      await sendEmail(email, 'Randevu Hatırlatma', html);
    }

    return NextResponse.json({ ok: true, sent: list.length });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status: 500 });
  }
}





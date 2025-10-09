import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// Bir randevuyu iptal eder, ardından aynı slot için bekleyen taleplerden ilk uygunu onaylar
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id } = body ?? {};
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // İptal edilecek randevuyu al
    const { data: appt, error: e0 } = await supabase
      .from('appointments')
      .select('id, client_id, date, time, status')
      .eq('id', id)
      .single();
    if (e0 || !appt) throw e0 || new Error('Appointment not found');

    // İptal etmeden önce cutoff kontrolü ve no-show ücreti
    // Policy ve cutoff hesapla
    const { data: policy, error: epol } = await supabase
      .from('client_no_show_policies')
      .select('enabled, fee_cents, cutoff_hours, client_id')
      .eq('client_id', appt.client_id)
      .single();
    if (epol && epol.code !== 'PGRST116') throw epol;

    const now = new Date();
    const apptDateTime = new Date(`${appt.date}T${appt.time}`);
    const hoursDiff = (apptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // İptal et
    const { error: e1 } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id);
    if (e1) throw e1;

    // Geç iptal ise no-show tahsilatı tetikle
    if (policy?.enabled && hoursDiff < (policy.cutoff_hours ?? 24)) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/billing/charge-no-show`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appointmentId: appt.id })
        });
      } catch (_e) {
        // Sessiz geç
      }
    }

    // Aynı tarih-saat için pending talepleri sırayla getir
    const { data: pendings, error: e2 } = await supabase
      .from('pending_appointments')
      .select('*')
      .eq('status', 'pending')
      .eq('date', appt.date)
      .eq('time', appt.time)
      .order('created_at', { ascending: true });
    if (e2) throw e2;

    if (pendings && pendings.length > 0) {
      const candidate = pendings[0];
      // Yeni randevu oluştur
      const { error: e3 } = await supabase
        .from('appointments')
        .insert({
          client_id: null,
          date: candidate.date,
          time: candidate.time,
          status: 'scheduled'
        });
      if (e3) throw e3;

      // Pending'i onaylandı olarak işaretle
      const { error: e4 } = await supabase
        .from('pending_appointments')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', candidate.id);
      if (e4) throw e4;
    }

    return NextResponse.json({ ok: true, waitlistPromoted: Boolean(pendings && pendings.length > 0) });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status: 500 });
  }
}



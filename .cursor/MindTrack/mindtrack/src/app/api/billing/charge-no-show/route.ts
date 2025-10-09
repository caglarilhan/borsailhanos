import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// Trigger a no-show charge for a client if policy enabled and has a default PM
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { appointmentId } = await request.json();
    if (!appointmentId) return NextResponse.json({ error: 'Missing appointmentId' }, { status: 400 });

    // Fetch appointment and client
    const { data: appt, error: e1 } = await supabase
      .from('appointments')
      .select('id, client_id, date, time')
      .eq('id', appointmentId)
      .single();
    if (e1 || !appt) throw e1 || new Error('Appointment not found');

    const { data: client, error: e2 } = await supabase
      .from('clients')
      .select('id, email, name, stripe_customer_id')
      .eq('id', appt.client_id)
      .single();
    if (e2 || !client) throw e2 || new Error('Client not found');

    // Fetch policy
    const { data: policy, error: e3 } = await supabase
      .from('client_no_show_policies')
      .select('enabled, fee_cents')
      .eq('client_id', client.id)
      .single();
    if (e3 || !policy || !policy.enabled) {
      return NextResponse.json({ skipped: true, reason: 'Policy disabled' });
    }

    // Ensure stripe customer exists
    let customerId = client.stripe_customer_id as string | null;
    if (!customerId) {
      const existing = await stripe.customers.list({ email: client.email || undefined, limit: 1 });
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
      } else {
        const created = await stripe.customers.create({ email: client.email || undefined, name: client.name || undefined, metadata: { clientId: client.id } });
        customerId = created.id;
      }
      await supabase.from('clients').update({ stripe_customer_id: customerId }).eq('id', client.id);
    }

    // Get default payment method
    const pmList = await stripe.paymentMethods.list({ customer: customerId!, type: 'card' });
    if (pmList.data.length === 0) {
      return NextResponse.json({ skipped: true, reason: 'No saved card' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: policy.fee_cents,
      currency: 'usd',
      customer: customerId!,
      payment_method: pmList.data[0].id,
      off_session: true,
      confirm: true,
      description: `No-show fee for appointment ${appt.date} ${appt.time}`,
      metadata: { appointmentId: appt.id, clientId: client.id }
    });

    // Log charge
    await supabase.from('audit_logs').insert({
      owner_id: client.id,
      action: 'no_show_charge',
      entity: 'billing',
      meta: { appointmentId: appt.id, paymentIntentId: paymentIntent.id, amount: policy.fee_cents },
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ ok: true, paymentIntentId: paymentIntent.id });
  } catch (e: any) {
    console.error('No-show charge error:', e);
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}



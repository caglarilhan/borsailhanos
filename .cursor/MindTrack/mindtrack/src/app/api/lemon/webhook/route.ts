import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!secret) return NextResponse.json({ error: 'missing secret' }, { status: 500 });

    const rawBody = await request.text();
    const signature = request.headers.get('X-Signature') || request.headers.get('x-signature');
    if (!signature) return NextResponse.json({ error: 'missing signature' }, { status: 400 });

    const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    if (computed !== signature) {
      return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const event = body?.meta?.event_name as string | undefined;
    const customerEmail = body?.data?.attributes?.user_email as string | undefined;
    const renewAt = body?.data?.attributes?.renews_at as string | undefined;
    const planName = body?.data?.attributes?.variant_name as string | undefined;

    if (!event || !customerEmail) {
      return NextResponse.json({ ok: true });
    }

    const shouldActivate = event === 'subscription_created' || event === 'order_created' || event === 'subscription_resumed' || event === 'payment_success';
    const shouldDeactivate = event === 'subscription_cancelled' || event === 'subscription_expired' || event === 'subscription_paused' || event === 'payment_failed';

    if (shouldActivate || shouldDeactivate) {
      const { data: profile, error: findErr } = await supabase
        .from('profiles')
        .select('id, user_id, email')
        .eq('email', customerEmail)
        .maybeSingle();
      if (findErr) throw findErr;

      if (!profile) {
        // email eşleşmesi yoksa oluşturmayı dene (opsiyonel)
        const { error: insErr } = await supabase.from('profiles').insert({ email: customerEmail, is_active: shouldActivate, plan: planName ?? null, renew_at: renewAt ?? null });
        if (insErr) throw insErr;
      } else {
        const { error: updErr } = await supabase
          .from('profiles')
          .update({ is_active: shouldActivate ? true : false, plan: planName ?? profile.plan, renew_at: renewAt ?? profile.renew_at })
          .eq('id', profile.id);
        if (updErr) throw updErr;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'webhook failed' }, { status: 500 });
  }
}



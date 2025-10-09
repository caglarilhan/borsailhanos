import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscription } = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
    }

    // Save subscription to database
    const { data: savedSubscription, error } = await supabase
      .from('notification_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys?.p256dh,
        auth: subscription.keys?.auth,
        is_active: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,endpoint' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, subscription: savedSubscription });
  } catch (e: any) {
    console.error('Error subscribing to notifications:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

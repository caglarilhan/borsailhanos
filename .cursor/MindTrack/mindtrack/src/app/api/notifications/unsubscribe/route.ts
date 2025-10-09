import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
    }

    // Remove subscription from database
    const { error } = await supabase
      .from('notification_subscriptions')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('endpoint', endpoint);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Error unsubscribing from notifications:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

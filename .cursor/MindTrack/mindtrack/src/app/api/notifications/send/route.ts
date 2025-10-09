import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';
import webpush from 'web-push';

// Configure web-push
webpush.setVapidDetails(
  process.env.NEXT_PUBLIC_VAPID_SUBJECT || 'mailto:admin@mindtrack.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, body, data, templateId, userIds } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    // Get notification template if templateId is provided
    let notificationData = { title, body, data };
    if (templateId) {
      const { data: template } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (template) {
        notificationData = {
          title: template.title,
          body: template.body,
          data: template.data || {}
        };
      }
    }

    // Get subscriptions to send to
    let query = supabase
      .from('notification_subscriptions')
      .select('*')
      .eq('is_active', true);

    if (userIds && userIds.length > 0) {
      query = query.in('user_id', userIds);
    } else {
      // Get user's clinic members if no specific users provided
      const { data: clinicMember } = await supabase
        .from('clinic_members')
        .select('clinic_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (clinicMember) {
        const { data: clinicUsers } = await supabase
          .from('clinic_members')
          .select('user_id')
          .eq('clinic_id', clinicMember.clinic_id)
          .eq('status', 'active');

        if (clinicUsers) {
          const userIds = clinicUsers.map(u => u.user_id);
          query = query.in('user_id', userIds);
        }
      }
    }

    const { data: subscriptions, error: subsError } = await query;

    if (subsError) throw subsError;

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ error: 'No active subscriptions found' }, { status: 400 });
    }

    // Send notifications
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          const payload = JSON.stringify({
            title: notificationData.title,
            body: notificationData.body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            data: notificationData.data
          });

          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
              }
            },
            payload
          );

          // Log successful notification
          await supabase
            .from('notification_logs')
            .insert({
              template_id: templateId || null,
              user_id: subscription.user_id,
              title: notificationData.title,
              body: notificationData.body,
              sent_at: new Date().toISOString(),
              status: 'sent'
            });

          return { success: true, userId: subscription.user_id };
        } catch (error) {
          console.error('Push notification failed for user:', subscription.user_id, error);
          
          // Log failed notification
          await supabase
            .from('notification_logs')
            .insert({
              template_id: templateId || null,
              user_id: subscription.user_id,
              title: notificationData.title,
              body: notificationData.body,
              sent_at: new Date().toISOString(),
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error'
            });

          return { success: false, userId: subscription.user_id, error };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    return NextResponse.json({
      success: true,
      sent: successful,
      failed: failed,
      total: results.length
    });
  } catch (e: any) {
    console.error('Error sending notifications:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

import Stripe from 'stripe';
import { headers } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');
    
    if (!sig) {
      return new Response('Missing stripe-signature header', { status: 400 });
    }

    const body = await req.arrayBuffer();
    const buf = Buffer.from(body);

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        buf,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Webhook signature verification failed', { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        console.log('Subscription created:', event.data.object);
        // TODO: Update user subscription status in database
        break;
      case 'customer.subscription.updated':
        console.log('Subscription updated:', event.data.object);
        // TODO: Update user subscription status in database
        break;
      case 'customer.subscription.deleted':
        console.log('Subscription deleted:', event.data.object);
        // TODO: Update user subscription status in database
        break;
      case 'invoice.payment_succeeded':
        console.log('Payment succeeded:', event.data.object);
        // TODO: Update user billing status
        break;
      case 'invoice.payment_failed':
        console.log('Payment failed:', event.data.object);
        // TODO: Handle failed payment
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook error', { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

// Create a Stripe Checkout Session in setup mode to save a card for a client
export async function POST(request: NextRequest) {
  try {
    const { clientId, clientEmail, clientName, successUrl, cancelUrl } = await request.json();
    if (!clientId || !clientEmail) {
      return NextResponse.json({ error: 'Missing clientId or clientEmail' }, { status: 400 });
    }

    // Create or find customer by email
    let customer;
    const existing = await stripe.customers.list({ email: clientEmail, limit: 1 });
    if (existing.data.length > 0) {
      customer = existing.data[0];
    } else {
      customer = await stripe.customers.create({
        email: clientEmail,
        name: clientName,
        metadata: { clientId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'setup',
      payment_method_types: ['card'],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/clients/${clientId}?card_saved=1`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/clients/${clientId}?card_saved=0`,
      metadata: { clientId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe save card error:', error);
    return NextResponse.json({ error: 'Failed to create setup session' }, { status: 500 });
  }
}



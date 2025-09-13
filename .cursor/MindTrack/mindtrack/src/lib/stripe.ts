import Stripe from 'stripe';

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2024-06-20',
  typescript: true,
});

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy',
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_dummy',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy',
  currency: 'usd',
  country: 'US',
};

// Payment methods
export const PAYMENT_METHODS = {
  card: 'card',
  bank_transfer: 'us_bank_transfer',
  ach_credit_transfer: 'ach_credit_transfer',
} as const;

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 0,
    interval: 'month',
    features: [
      '3 clients',
      '10 appointments/month',
      'Basic notes',
      'Email support'
    ],
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID,
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 2900, // $29.00 in cents
    interval: 'month',
    features: [
      'Unlimited clients',
      'AI-powered notes',
      'SMS reminders',
      'Analytics dashboard',
      'Priority support'
    ],
    stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
  },
  practice: {
    id: 'practice',
    name: 'Practice',
    price: 7900, // $79.00 in cents
    interval: 'month',
    features: [
      'Multi-user support',
      'Advanced analytics',
      'Insurance billing',
      'API access',
      'Custom integrations'
    ],
    stripePriceId: process.env.STRIPE_PRACTICE_PRICE_ID,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 19900, // $199.00 in cents
    interval: 'month',
    features: [
      'White-label solution',
      'Custom integrations',
      'Priority support',
      'Dedicated account manager',
      'SLA guarantee'
    ],
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
  },
} as const;

// Helper functions
export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceInCents / 100);
}

export function getPlanById(planId: string) {
  return Object.values(SUBSCRIPTION_PLANS).find(plan => plan.id === planId);
}

export function getPlanByStripePriceId(stripePriceId: string) {
  return Object.values(SUBSCRIPTION_PLANS).find(plan => plan.stripePriceId === stripePriceId);
}

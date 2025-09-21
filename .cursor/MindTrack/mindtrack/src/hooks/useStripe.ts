'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG, SUBSCRIPTION_PLANS } from '@/lib/stripe';

const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);

export interface SubscriptionStatus {
  status: 'active' | 'inactive' | 'canceled' | 'past_due';
  plan: string;
  subscription: {
    id: string;
    status: string;
    currentPeriodStart: number;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export function useStripe() {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);

  // Get subscription status
  const getSubscriptionStatus = async (userId: string) => {
    try {
      const response = await fetch(`/api/stripe/checkout?userId=${userId}`);
      const data = await response.json();
      setSubscription(data);
      return data;
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return null;
    }
  };

  // Create checkout session
  const createCheckoutSession = async (
    planId: string,
    userId: string,
    userEmail: string,
    successUrl?: string,
    cancelUrl?: string
  ) => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId,
          userEmail,
          successUrl,
          cancelUrl,
        }),
      });

      const { sessionId } = await response.json();

      if (!sessionId) {
        throw new Error('Failed to create checkout session');
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cancel subscription
  const cancelSubscription = async (subscriptionId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      // Refresh subscription status
      if (subscription?.subscription?.id === subscriptionId) {
        await getSubscriptionStatus(subscription.subscription.id);
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get plan details
  const getPlan = (planId: string) => {
    return SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
  };

  // Check if user has access to feature
  const hasAccess = (feature: string) => {
    if (!subscription) return false;
    
    const plan = getPlan(subscription.plan);
    if (!plan) return false;

    // Check feature access based on plan
    switch (feature) {
      case 'unlimited_clients':
        return ['professional', 'practice', 'enterprise'].includes(subscription.plan);
      case 'ai_notes':
        return ['professional', 'practice', 'enterprise'].includes(subscription.plan);
      case 'sms_reminders':
        return ['professional', 'practice', 'enterprise'].includes(subscription.plan);
      case 'analytics':
        return ['professional', 'practice', 'enterprise'].includes(subscription.plan);
      case 'multi_user':
        return ['practice', 'enterprise'].includes(subscription.plan);
      case 'insurance_billing':
        return ['practice', 'enterprise'].includes(subscription.plan);
      case 'api_access':
        return ['practice', 'enterprise'].includes(subscription.plan);
      case 'white_label':
        return subscription.plan === 'enterprise';
      default:
        return false;
    }
  };

  return {
    loading,
    subscription,
    getSubscriptionStatus,
    createCheckoutSession,
    cancelSubscription,
    getPlan,
    hasAccess,
  };
}



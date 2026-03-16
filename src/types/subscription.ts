export interface Subscription {
  id: number;
  userId: number;
  tier: 'starter' | 'growth' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'expired' | 'past_due';
  creditsPerMonth: number;
  startedAt: string;
  endsAt: string | null;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}

export interface CreditBalance {
  userId: number;
  balance: number;
  monthlyCredits: number;
  totalPurchased: number;
  totalUsed: number;
  tier: 'starter' | 'growth' | 'pro' | 'enterprise';
}

export interface CreditTransaction {
  id: number;
  userId: number;
  amount: number;
  type: 'purchase' | 'usage' | 'refund' | 'bonus' | 'subscription';
  description: string;
  relatedId?: string;
  createdAt: string;
}

export interface CreditPurchase {
  credits: number;
  price: number;
  method: 'stripe' | 'crypto' | 'credits';
}

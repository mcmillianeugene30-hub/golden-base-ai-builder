import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      fid?: number;
      isAdmin?: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    fid?: number;
    isAdmin?: boolean;
  }
}

export interface User {
  id: string;
  fid?: number;
  username?: string;
  walletAddress?: string;
  email?: string;
  credits: number;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: 'starter' | 'growth' | 'pro' | 'enterprise';
  status: 'active' | 'paused' | 'cancelled';
  stripeSubscriptionId?: string;
  credits: number;
  maxApps: number;
  renewAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface App {
  id: string;
  userId: string;
  name: string;
  description?: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Version {
  id: string;
  appId: string;
  code: string;
  comment?: string;
  createdAt: Date;
}

export interface Deployment {
  id: string;
  appId: string;
  platform: string;
  url?: string;
  status: string;
  createdAt: Date;
}

export interface ApiUsage {
  id: string;
  userId: string;
  provider: string;
  model: string;
  creditsUsed: number;
  createdAt: Date;
}

export interface ConnectorAuth {
  id: string;
  userId: string;
  connector: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'subscription' | 'credits_purchased' | 'crypto_payment' | 'frame_payment';
  amount: number;
  currency: string;
  method: 'stripe' | 'crypto' | 'frame';
  status: 'pending' | 'completed' | 'failed';
  stripePaymentId?: string;
  txHash?: string;
  createdAt: Date;
}

export interface MarketplaceItem {
  id: string;
  type: 'app' | 'connector';
  name: string;
  description: string;
  developerId: string;
  price?: number;
  rating: number;
  reviews: number;
  installs: number;
  status: 'pending' | 'approved' | 'rejected';
  manifest?: any;
  createdAt: Date;
  updatedAt: Date;
}

export type AIProvider = 'groq' | 'openrouter' | 'openai' | 'gemini';

export interface AIServiceResponse {
  content: string;
  creditsUsed: number;
  provider: string;
}

export interface SubscriptionTier {
  name: string;
  price: number;
  credits: number;
  maxApps: number;
  aiProviders: string[];
  connectors?: string[];
  allConnectors?: boolean;
  features: string[];
}

export interface CreditPack {
  credits: number;
  price: number;
  bonus: number;
}

export interface Connector {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  icon: string;
  pricing: string;
  connected: boolean;
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  starter: {
    name: 'Starter',
    price: 1.99,
    credits: 500,
    maxApps: 3,
    aiProviders: ['groq', 'openrouter'],
    features: ['Basic templates', 'Farcaster Frame generation', 'Live preview', 'Code export'],
  },
  growth: {
    name: 'Growth',
    price: 4.99,
    credits: 2000,
    maxApps: 10,
    aiProviders: ['groq', 'openrouter'],
    connectors: ['github', 'vercel', 'netlify'],
    features: ['Basic connectors', 'Template library', 'App analytics', 'Community support'],
  },
  pro: {
    name: 'Pro',
    price: 9.99,
    credits: 5000,
    maxApps: 25,
    aiProviders: ['groq', 'openrouter', 'openai', 'gemini'],
    allConnectors: true,
    features: [
      'ALL AI providers',
      'ALL 20+ connectors',
      'Premium AI models',
      'Token deployment on Base',
      'DeFi features',
      'Priority support',
      'Advanced analytics',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 29.99,
    credits: 15000,
    maxApps: 100,
    aiProviders: ['groq', 'openrouter', 'openai', 'gemini'],
    allConnectors: true,
    features: [
      'Priority AI access',
      'Higher connector limits',
      'Custom model fine-tuning',
      'Dedicated support (24/7)',
      'Early access to features',
      'White-label options',
      'API access',
      'Team collaboration',
    ],
  },
};

export const CREDIT_PACKS: Record<string, CreditPack> = {
  '500': { credits: 500, price: 4.99, bonus: 0 },
  '1500': { credits: 1500, price: 9.99, bonus: 50 },
  '3500': { credits: 3500, price: 19.99, bonus: 75 },
  '8000': { credits: 8000, price: 39.99, bonus: 100 },
};

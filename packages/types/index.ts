export interface User {
  id: string;
  fid?: number;
  username?: string;
  walletAddress?: string;
  email?: string;
  credits: number;
  isAdmin: boolean;
  subscriptionId?: string;
  subscription?: Subscription | null;
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
  versions: Version[];
  deployments: Deployment[];
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
  currency: 'USD' | 'USDC' | 'ETH';
  method: 'stripe' | 'crypto' | 'frame';
  status: 'pending' | 'completed' | 'failed';
  stripePaymentId?: string;
  txHash?: string;
  metadata?: any;
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
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

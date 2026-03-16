export const ADMIN_CONFIG = {
  fid: 1378286,
  username: 'urbanwarrior79',
  wallet: '0xcc9569bF1d87B7a18BD3363413b823AaF06084d3',
  
  privileges: {
    freeAccess: true,
    unlimitedCredits: true,
    unlimitedApps: true,
    bypassPayments: true,
    fullDashboardAccess: true,
    viewAllUserData: true,
    approveMarketplace: true,
    manageConnectors: true,
    withdrawFunds: true,
  },
};

export const SUBSCRIPTION_TIERS = {
  starter: {
    name: 'Starter',
    price: 1.99,
    credits: 500,
    maxApps: 3,
    aiProviders: ['groq', 'openrouter'],
    features: [
      'Basic templates',
      'Farcaster Frame generation',
      'Live preview',
      'Code export',
    ],
  },
  growth: {
    name: 'Growth',
    price: 4.99,
    credits: 2000,
    maxApps: 10,
    aiProviders: ['groq', 'openrouter'],
    connectors: ['github', 'vercel', 'netlify'],
    features: [
      'Basic connectors',
      'Template library',
      'App analytics',
      'Community support',
    ],
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

export const CREDIT_PACKS = {
  '500': { credits: 500, price: 4.99, bonus: 0 },
  '1500': { credits: 1500, price: 9.99, bonus: 50 },
  '3500': { credits: 3500, price: 19.99, bonus: 75 },
  '8000': { credits: 8000, price: 39.99, bonus: 100 },
};

export const CREDIT_COSTS = {
  appGeneration: {
    free: { min: 50, max: 200 },
    premium: { min: 300, max: 800 },
  },
  codeEdit: { min: 20, max: 100 },
  deployment: 100,
  connectorUsage: { min: 10, max: 100 },
  frameGeneration: 50,
};

export const PLATFORM_WALLET = '0xcc9569bF1d87B7a18BD3363413b823AaF06084d3';
export const PLATFORM_REVENUE_SHARE = 0.4;
export const DEVELOPER_REVENUE_SHARE = 0.6;

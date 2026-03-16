/**
 * Connector Registry - Manages all available connectors
 */

export interface ConnectorConfig {
  id: string;
  name: string;
  description: string;
  category: 'dev' | 'crypto' | 'storage' | 'payment' | 'social' | 'analytics';
  icon: string;
  version: string;
  pricePerUse: number; // credits
  oauthVersion: '1.0a' | '2.0' | 'none';
  authUrl: string;
  tokenUrl: string;
  scope: string[];
  developerShare: number; // percentage
}

export const CONNECTORS: Record<string, ConnectorConfig> = {
  // Development Platforms
  vercel: {
    id: 'vercel',
    name: 'Vercel',
    description: 'Deploy apps to Vercel with one click',
    category: 'dev',
    icon: '▲',
    version: '1.0.0',
    pricePerUse: 50,
    oauthVersion: '2.0',
    authUrl: 'https://vercel.com/oauth/authorize',
    tokenUrl: 'https://vercel.com/v2/oauth/token',
    scope: ['deploy', 'team', 'user'],
    developerShare: 60
  },
  netlify: {
    id: 'netlify',
    name: 'Netlify',
    description: 'Deploy and host static sites',
    category: 'dev',
    icon: 'N',
    version: '1.0.0',
    pricePerUse: 45,
    oauthVersion: '2.0',
    authUrl: 'https://app.netlify.com/oauth/authorize',
    tokenUrl: 'https://api.netlify.com/oauth/token',
    scope: ['site:write', 'user:read'],
    developerShare: 60
  },
  cloudflare: {
    id: 'cloudflare',
    name: 'Cloudflare Pages',
    description: 'Deploy to Cloudflare Pages',
    category: 'dev',
    icon: '☁️',
    version: '1.0.0',
    pricePerUse: 40,
    oauthVersion: '2.0',
    authUrl: 'https://dash.cloudflare.com/oauth2/authorize',
    tokenUrl: 'https://dash.cloudflare.com/oauth2/token',
    scope: ['account:read', 'pages:edit'],
    developerShare: 60
  },
  supabase: {
    id: 'supabase',
    name: 'Supabase',
    description: 'Database, auth, and real-time features',
    category: 'dev',
    icon: '◉',
    version: '1.0.0',
    pricePerUse: 60,
    oauthVersion: '2.0',
    authUrl: 'https://supabase.com/auth/v1/authorize',
    tokenUrl: 'https://supabase.com/auth/v1/token',
    scope: ['auth:read', 'storage:read', 'db:read'],
    developerShare: 60
  },

  // Developer Tools
  github: {
    id: 'github',
    name: 'GitHub',
    description: 'Access repositories, issues, and PRs',
    category: 'dev',
    icon: '⌘',
    version: '1.0.0',
    pricePerUse: 30,
    oauthVersion: '2.0',
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    scope: ['repo', 'read:org'],
    developerShare: 60
  },
  linear: {
    id: 'linear',
    name: 'Linear',
    description: 'Project management and issue tracking',
    category: 'dev',
    icon: '⚡',
    version: '1.0.0',
    pricePerUse: 35,
    oauthVersion: '2.0',
    authUrl: 'https://linear.app/oauth/authorize',
    tokenUrl: 'https://api.linear.app/oauth/token',
    scope: ['read', 'write', 'issues:read'],
    developerShare: 60
  },
  notion: {
    id: 'notion',
    name: 'Notion',
    description: 'Documentation and knowledge base',
    category: 'dev',
    icon: 'N',
    version: '1.0.0',
    pricePerUse: 40,
    oauthVersion: '2.0',
    authUrl: 'https://api.notion.com/v1/oauth/authorize',
    tokenUrl: 'https://api.notion.com/v1/oauth/token',
    scope: [],
    developerShare: 60
  },
  slack: {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and notifications',
    category: 'social',
    icon: 'S',
    version: '1.0.0',
    pricePerUse: 25,
    oauthVersion: '2.0',
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    scope: ['chat:write', 'channels:read', 'users:read'],
    developerShare: 60
  },
  discord: {
    id: 'discord',
    name: 'Discord',
    description: 'Community and chat integration',
    category: 'social',
    icon: 'D',
    version: '1.0.0',
    pricePerUse: 25,
    oauthVersion: '2.0',
    authUrl: 'https://discord.com/api/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    scope: ['bot', 'identify', 'guilds'],
    developerShare: 60
  },

  // Crypto/DeFi
  coinbase: {
    id: 'coinbase',
    name: 'Coinbase',
    description: 'Trading and portfolio management',
    category: 'crypto',
    icon: '◈',
    version: '1.0.0',
    pricePerUse: 50,
    oauthVersion: '2.0',
    authUrl: 'https://www.coinbase.com/oauth/authorize',
    tokenUrl: 'https://api.coinbase.com/oauth/token',
    scope: ['wallet:accounts:read', 'wallet:transactions:read'],
    developerShare: 60
  },
  alchemy: {
    id: 'alchemy',
    name: 'Alchemy',
    description: 'Blockchain data and RPC services',
    category: 'crypto',
    icon: '⚗️',
    version: '1.0.0',
    pricePerUse: 20,
    oauthVersion: 'none',
    authUrl: '',
    tokenUrl: '',
    scope: [],
    developerShare: 60
  },
  infura: {
    id: 'infura',
    name: 'Infura',
    description: 'Ethereum and IPFS infrastructure',
    category: 'crypto',
    icon: 'I',
    version: '1.0.0',
    pricePerUse: 20,
    oauthVersion: 'none',
    authUrl: '',
    tokenUrl: '',
    scope: [],
    developerShare: 60
  },
  quicknode: {
    id: 'quicknode',
    name: 'QuickNode',
    description: 'Multi-chain blockchain infrastructure',
    category: 'crypto',
    icon: 'Q',
    version: '1.0.0',
    pricePerUse: 25,
    oauthVersion: 'none',
    authUrl: '',
    tokenUrl: '',
    scope: [],
    developerShare: 60
  },
  moralis: {
    id: 'moralis',
    name: 'Moralis',
    description: 'Web3 data and APIs',
    category: 'crypto',
    icon: 'M',
    version: '1.0.0',
    pricePerUse: 30,
    oauthVersion: '2.0',
    authUrl: 'https://auth.moralis.io/oauth2/authorize',
    tokenUrl: 'https://auth.moralis.io/oauth2/token',
    scope: ['user:email', 'user:info'],
    developerShare: 60
  },
  covalent: {
    id: 'covalent',
    name: 'Covalent',
    description: 'Blockchain analytics and data',
    category: 'crypto',
    icon: 'C',
    version: '1.0.0',
    pricePerUse: 25,
    oauthVersion: '2.0',
    authUrl: 'https://www.covalenthq.com/oauth2/authorize',
    tokenUrl: 'https://api.covalenthq.com/oauth2/token',
    scope: ['balance:read', 'transaction:read'],
    developerShare: 60
  },
  dune: {
    id: 'dune',
    name: 'Dune Analytics',
    description: 'Crypto analytics and dashboards',
    category: 'crypto',
    icon: 'D',
    version: '1.0.0',
    pricePerUse: 35,
    oauthVersion: '2.0',
    authUrl: 'https://dune.com/oauth/authorize',
    tokenUrl: 'https://dune.com/oauth/token',
    scope: ['read:queries', 'read:user'],
    developerShare: 60
  },
  thegraph: {
    id: 'thegraph',
    name: 'The Graph',
    description: 'Indexed blockchain data',
    category: 'crypto',
    icon: 'G',
    version: '1.0.0',
    pricePerUse: 20,
    oauthVersion: 'none',
    authUrl: '',
    tokenUrl: '',
    scope: [],
    developerShare: 60
  },

  // Payments
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and subscriptions',
    category: 'payment',
    icon: 'S',
    version: '1.0.0',
    pricePerUse: 40,
    oauthVersion: '2.0',
    authUrl: 'https://connect.stripe.com/oauth/authorize',
    tokenUrl: 'https://connect.stripe.com/oauth/token',
    scope: ['read_write'],
    developerShare: 60
  },

  // Storage
  aws_s3: {
    id: 'aws_s3',
    name: 'AWS S3',
    description: 'File storage and CDN',
    category: 'storage',
    icon: 'A',
    version: '1.0.0',
    pricePerUse: 15,
    oauthVersion: '2.0',
    authUrl: 'https://signin.aws.amazon.com/oauth',
    tokenUrl: 'https://oauth2.amazonaws.com/api/token',
    scope: ['s3:read', 's3:write'],
    developerShare: 60
  },
  ipfs: {
    id: 'ipfs',
    name: 'IPFS',
    description: 'Decentralized file storage',
    category: 'storage',
    icon: '◐',
    version: '1.0.0',
    pricePerUse: 10,
    oauthVersion: 'none',
    authUrl: '',
    tokenUrl: '',
    scope: [],
    developerShare: 60
  }
};

/**
 * Get all connectors
 */
export function getAllConnectors(): ConnectorConfig[] {
  return Object.values(CONNECTORS);
}

/**
 * Get connector by ID
 */
export function getConnector(id: string): ConnectorConfig | null {
  return CONNECTORS[id] || null;
}

/**
 * Get connectors by category
 */
export function getConnectorsByCategory(category: ConnectorConfig['category']): ConnectorConfig[] {
  return Object.values(CONNECTORS).filter((c) => c.category === category);
}

/**
 * Get categories
 */
export function getCategories(): Array<{ id: string; name: string; count: number }> {
  const categories: Record<string, { name: string; count: number }> = {
    dev: { name: 'Development', count: 0 },
    crypto: { name: 'Crypto & DeFi', count: 0 },
    storage: { name: 'Storage', count: 0 },
    payment: { name: 'Payments', count: 0 },
    social: { name: 'Social', count: 0 },
    analytics: { name: 'Analytics', count: 0 }
  };

  Object.values(CONNECTORS).forEach((connector) => {
    categories[connector.category].count++;
  });

  return Object.entries(categories).map(([id, data]) => ({ id, ...data }));
}

'use client';

import { useState, useEffect } from 'react';
import { Plug2, ExternalLink, CheckCircle2, Lock } from 'lucide-react';

const connectors = [
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'App deployment and preview environments',
    category: 'Development',
    icon: '⚡',
    pricing: '10 credits/action',
    connected: false,
  },
  {
    id: 'netlify',
    name: 'Netlify',
    description: 'Static site hosting and edge functions',
    category: 'Development',
    icon: '🌐',
    pricing: '10 credits/action',
    connected: false,
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Pages',
    description: 'Global static site hosting with edge computing',
    category: 'Development',
    icon: '☁️',
    pricing: '8 credits/action',
    connected: false,
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Backend as a service with database and auth',
    category: 'Development',
    icon: '🗄️',
    pricing: '15 credits/action',
    connected: false,
  },
  {
    id: 'railway',
    name: 'Railway',
    description: 'Infrastructure platform for full-stack apps',
    category: 'Development',
    icon: '🚂',
    pricing: '12 credits/action',
    connected: false,
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Version control, repositories, and CI/CD',
    category: 'Developer Tools',
    icon: '💻',
    pricing: '10 credits/action',
    connected: false,
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Issue tracking and project management',
    category: 'Developer Tools',
    icon: '📊',
    pricing: '15 credits/action',
    connected: false,
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Documentation and wikis',
    category: 'Developer Tools',
    icon: '📝',
    pricing: '12 credits/action',
    connected: false,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and notifications',
    category: 'Developer Tools',
    icon: '💬',
    pricing: '10 credits/action',
    connected: false,
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Community and support',
    category: 'Developer Tools',
    icon: '🎮',
    pricing: '10 credits/action',
    connected: false,
  },
  {
    id: 'alchemy',
    name: 'Alchemy',
    description: 'Blockchain data and RPC nodes',
    category: 'Crypto/Web3',
    icon: '⛓',
    pricing: '20 credits/action',
    connected: false,
  },
  {
    id: 'infura',
    name: 'Infura',
    description: 'Ethereum RPC and Web3 infrastructure',
    category: 'Crypto/Web3',
    icon: '🔗',
    pricing: '20 credits/action',
    connected: false,
  },
  {
    id: 'quicknode',
    name: 'QuickNode',
    description: 'Multi-chain Web3 API',
    category: 'Crypto/Web3',
    icon: '🌐',
    pricing: '20 credits/action',
    connected: false,
  },
  {
    id: 'moralis',
    name: 'Moralis',
    description: 'Web3 data, NFT and DeFi APIs',
    category: 'Crypto/Web3',
    icon: '💎',
    pricing: '25 credits/action',
    connected: false,
  },
  {
    id: 'covalent',
    name: 'Covalent',
    description: 'Blockchain analytics and transaction data',
    category: 'Crypto/Web3',
    icon: '📈',
    pricing: '20 credits/action',
    connected: false,
  },
  {
    id: 'dune',
    name: 'Dune Analytics',
    description: 'Crypto analytics and dashboards',
    category: 'Crypto/Web3',
    icon: '📊',
    pricing: '30 credits/action',
    connected: false,
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    description: 'Crypto trading and payments',
    category: 'Payments',
    icon: '💰',
    pricing: '20 credits/action',
    connected: false,
  },
  {
    id: 'uniswap',
    name: 'Uniswap',
    description: 'Token swaps and DeFi',
    category: 'Payments',
    icon: '🦄',
    pricing: '25 credits/action',
    connected: false,
  },
  {
    id: 'aave',
    name: 'Aave',
    description: 'Lending protocol',
    category: 'Payments',
    icon: '🏦',
    pricing: '25 credits/action',
    connected: false,
  },
  {
    id: 'aws-s3',
    name: 'AWS S3',
    description: 'Object storage and file hosting',
    category: 'Storage',
    icon: '📦',
    pricing: '15 credits/action',
    connected: false,
  },
  {
    id: 'ipfs',
    name: 'IPFS',
    description: 'Decentralized storage',
    category: 'Storage',
    icon: '🌲',
    pricing: '10 credits/action',
    connected: false,
  },
  {
    id: 'cloudflare-r2',
    name: 'Cloudflare R2',
    description: 'S3-compatible storage',
    category: 'Storage',
    icon: '☁️',
    pricing: '12 credits/action',
    connected: false,
  },
];

export default function ConnectorsPage() {
  const [filter, setFilter] = useState('all');

  const categories = ['all', 'Development', 'Developer Tools', 'Crypto/Web3', 'Payments', 'Storage'];

  const filteredConnectors = filter === 'all' 
    ? connectors 
    : connectors.filter(c => c.category === filter);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Platform Connectors
        </h1>
        <p className="text-gray-400">
          Integrate your favorite tools and platforms with your apps
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === category
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConnectors.map((connector) => (
          <ConnectorCard key={connector.id} connector={connector} />
        ))}
      </div>
    </div>
  );
}

function ConnectorCard({ connector }: { connector: any }) {
  const handleConnect = () => {
    alert(`OAuth flow for ${connector.name} would start here`);
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-yellow-400/50 transition-colors">
      <div className="flex items-start gap-4 mb-4">
        <div className="text-4xl">{connector.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-white">
              {connector.name}
            </h3>
            {connector.connected ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <Lock className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div className="text-sm text-yellow-400 mb-2">
            {connector.pricing}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        {connector.description}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 px-2 py-1 rounded-full bg-white/5">
          {connector.category}
        </span>
        <button
          onClick={handleConnect}
          disabled={connector.connected}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            connector.connected
              ? 'bg-green-400/20 text-green-400 cursor-default'
              : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:opacity-90'
          }`}
        >
          <Plug2 className="w-4 h-4" />
          {connector.connected ? 'Connected' : 'Connect'}
        </button>
      </div>
    </div>
  );
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed connectors
  const connectors = [
    // Development Platforms
    { name: 'vercel', displayName: 'Vercel', description: 'App deployment and preview environments', category: 'development', pricing: { usageBased: true, costPerRequest: 10 } },
    { name: 'netlify', displayName: 'Netlify', description: 'Static site hosting and edge functions', category: 'development', pricing: { usageBased: true, costPerRequest: 10 } },
    { name: 'cloudflare', displayName: 'Cloudflare Pages', description: 'Global static site hosting with edge computing', category: 'development', pricing: { usageBased: true, costPerRequest: 8 } },
    { name: 'supabase', displayName: 'Supabase', description: 'Backend as a service with database and auth', category: 'development', pricing: { usageBased: true, costPerRequest: 15 } },
    { name: 'railway', displayName: 'Railway', description: 'Infrastructure platform for full-stack apps', category: 'development', pricing: { usageBased: true, costPerRequest: 12 } },
    
    // Developer Tools
    { name: 'github', displayName: 'GitHub', description: 'Version control, repositories, and CI/CD', category: 'developer', pricing: { usageBased: true, costPerRequest: 10 } },
    { name: 'linear', displayName: 'Linear', description: 'Issue tracking and project management', category: 'developer', pricing: { usageBased: true, costPerRequest: 15 } },
    { name: 'notion', displayName: 'Notion', description: 'Documentation and wikis', category: 'developer', pricing: { usageBased: true, costPerRequest: 12 } },
    { name: 'slack', displayName: 'Slack', description: 'Team communication and notifications', category: 'developer', pricing: { usageBased: true, costPerRequest: 10 } },
    { name: 'discord', displayName: 'Discord', description: 'Community and support', category: 'developer', pricing: { usageBased: true, costPerRequest: 10 } },
    { name: 'gitlab', displayName: 'GitLab', description: 'CI/CD and repository management', category: 'developer', pricing: { usageBased: true, costPerRequest: 10 } },
    
    // Crypto/Web3
    { name: 'alchemy', displayName: 'Alchemy', description: 'Blockchain data and RPC nodes', category: 'crypto', pricing: { usageBased: true, costPerRequest: 20 } },
    { name: 'infura', displayName: 'Infura', description: 'Ethereum RPC and Web3 infrastructure', category: 'crypto', pricing: { usageBased: true, costPerRequest: 20 } },
    { name: 'quicknode', displayName: 'QuickNode', description: 'Multi-chain Web3 API', category: 'crypto', pricing: { usageBased: true, costPerRequest: 20 } },
    { name: 'moralis', displayName: 'Moralis', description: 'Web3 data, NFT and DeFi APIs', category: 'crypto', pricing: { usageBased: true, costPerRequest: 25 } },
    { name: 'covalent', displayName: 'Covalent', description: 'Blockchain analytics and transaction data', category: 'crypto', pricing: { usageBased: true, costPerRequest: 20 } },
    { name: 'dune', displayName: 'Dune Analytics', description: 'Crypto analytics and dashboards', category: 'crypto', pricing: { usageBased: true, costPerRequest: 30 } },
    { name: 'thegraph', displayName: 'The Graph Protocol', description: 'Indexed blockchain data', category: 'crypto', pricing: { usageBased: true, costPerRequest: 25 } },
    
    // Payments & Finance
    { name: 'coinbase', displayName: 'Coinbase', description: 'Crypto trading and payments', category: 'payments', pricing: { usageBased: true, costPerRequest: 20 } },
    { name: 'uniswap', displayName: 'Uniswap', description: 'Token swaps and DeFi', category: 'payments', pricing: { usageBased: true, costPerRequest: 25 } },
    { name: 'aave', displayName: 'Aave', description: 'Lending protocol', category: 'payments', pricing: { usageBased: true, costPerRequest: 25 } },
    
    // Storage & CDN
    { name: 'aws-s3', displayName: 'AWS S3', description: 'Object storage and file hosting', category: 'storage', pricing: { usageBased: true, costPerRequest: 15 } },
    { name: 'ipfs', displayName: 'IPFS', description: 'Decentralized storage', category: 'storage', pricing: { usageBased: true, costPerRequest: 10 } },
    { name: 'cloudflare-r2', displayName: 'Cloudflare R2', description: 'S3-compatible storage', category: 'storage', pricing: { usageBased: true, costPerRequest: 12 } },
  ];

  for (const connector of connectors) {
    await prisma.connector.upsert({
      where: { name: connector.name },
      update: {},
      create: connector,
    });
  }

  console.log('✅ Connectors seeded successfully');
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

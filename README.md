# GOLDEN BASE AI BUILDER

A comprehensive AI-powered application builder platform for Farcaster and Base blockchain.

## Features

- **AI-Powered App Generation**: Generate production-ready apps using multiple AI providers (Groq, OpenRouter, OpenAI, Gemini)
- **Subscription System**: Multiple tiers (Starter, Growth, Pro, Enterprise) with credit-based pricing
- **Payment Processing**: Stripe, Base crypto (USDC/ETH), and Farcaster Frames
- **20+ Connectors**: Integrate with GitHub, Vercel, Netlify, Supabase, and more
- **Marketplace**: Browse and submit apps and connectors
- **Token Deployment**: Deploy ERC-20 tokens on Base via Flaunch
- **DeFi Features**: GoldenSwap integration for swaps, staking, and farming
- **Admin Dashboard**: Full admin access for platform owner (FID: 1378286)

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js + Privy
- **Payments**: Stripe + Viem (Base blockchain)
- **AI**: Groq, OpenRouter, OpenAI, Gemini
- **Deployment**: Vercel (frontend) + Railway/Fly.io (backend)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Stripe account
- AI API keys (Groq, OpenRouter, etc.)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd golden-base-ai-builder
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
- Database connection string
- AI API keys
- Stripe keys
- Admin configuration

5. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `GROQ_API_KEY`: Groq API key for AI generation
- `OPENROUTER_API_KEY`: OpenRouter API key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `ADMIN_FID`: Admin Farcaster ID (1378286)

## Project Structure

```
golden-base-ai-builder/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Landing page
│   │   ├── pricing/           # Pricing page
│   │   ├── api/               # API routes
│   │   └── (dashboard)/       # Protected dashboard routes
│   ├── components/            # React components
│   ├── lib/                   # Utilities and services
│   └── types/                 # TypeScript types
├── packages/
│   ├── config/                # Platform configuration
│   └── db/                    # Prisma schema
└── public/                   # Static assets
```

## Payment Methods

### Stripe (Credit Cards)
- Monthly subscriptions
- One-time credit packs
- Webhook handling for updates

### Base Crypto
- USDC payments
- ETH payments
- Transaction verification

### Farcaster Frames
- One-tap purchases
- Frame manifests
- Cast generation

## Subscription Tiers

### Starter - $1.99/month
- 500 credits/month
- Up to 3 apps
- Basic AI providers (Groq, OpenRouter)

### Growth - $4.99/month
- 2,000 credits/month
- Up to 10 apps
- Basic connectors

### Pro - $9.99/month
- 5,000 credits/month
- Up to 25 apps
- All AI providers and connectors

### Enterprise - $29.99/month
- 15,000 credits/month
- Up to 100 apps
- Priority access and support

## Credit System

All platform features require credits:
- App generation: 50-200 credits (free AI), 300-800 credits (premium AI)
- Code editing: 20-100 credits
- Deployment: 100 credits
- Connector usage: 10-100 credits

## Connectors

Available connectors include:
- **Development**: Vercel, Netlify, Cloudflare Pages, Supabase, Railway
- **Developer Tools**: GitHub, Linear, Notion, Slack, Discord, GitLab
- **Crypto/Web3**: Alchemy, Infura, QuickNode, Moralis, Covalent, Dune Analytics
- **Payments**: Coinbase, Uniswap, Aave
- **Storage**: AWS S3, IPFS, Cloudflare R2

## Admin Access

Admin user (FID: 1378286) has:
- Free unlimited access to all features
- Full dashboard access
- User management capabilities
- Marketplace approval authority
- Revenue tracking and payout management

## Deployment

### Vercel (Frontend)
```bash
vercel --prod
```

### Railway/Fly.io (Backend)
Deploy the API routes and background workers.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License - see LICENSE file for details.

## Support

For support, email support@goldenbase.ai or join our Farcaster channel.

## Roadmap

- [ ] Enhanced AI fine-tuning
- [ ] More connector integrations
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] White-label solutions

Built with ❤️ by the Golden Base AI Builder team

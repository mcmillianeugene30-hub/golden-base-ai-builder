# GOLDEN BASE AI BUILDER 🚀

A comprehensive AI-powered application builder platform for Farcaster and Base blockchain with subscription-based monetization.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)

## 🌟 Features

### Core Platform
- **AI-Powered App Generation**: Generate production-ready apps using multiple AI providers
- **No Free Tier**: All features require paid subscriptions or credits
- **Admin Access**: Unlimited access for platform owner (FID: 1378286)
- **Credit System**: Track all usage and deduct credits accordingly

### AI Providers
- **Groq** (Free API - Llama models, very fast)
- **OpenRouter** (Free API - Multiple models)
- **OpenAI** (Premium - GPT models)
- **Gemini** (Premium - Google models)

### Payment Systems
- **Stripe**: Credit card subscriptions and one-time credit packs
- **Base Crypto**: USDC and ETH payments on Base network
- **Farcaster Frames**: One-tap purchases via Frames

### Subscription Tiers
| Tier | Price | Credits | Apps | Features |
|------|--------|----------|-------|----------|
| Starter | $1.99/mo | 500 | 3 | Basic AI, templates |
| Growth | $4.99/mo | 2,000 | 10 | Basic connectors, analytics |
| Pro | $9.99/mo | 5,000 | 25 | All AI & connectors, DeFi |
| Enterprise | $29.99/mo | 15,000 | 100 | Priority access, API access |

### Connectors (20+)
**Development**: Vercel, Netlify, Cloudflare Pages, Supabase, Railway
**Developer Tools**: GitHub, Linear, Notion, Slack, Discord, GitLab
**Crypto/Web3**: Alchemy, Infura, QuickNode, Moralis, Covalent, Dune Analytics, The Graph
**Payments**: Coinbase, Uniswap, Aave
**Storage**: AWS S3, IPFS, Cloudflare R2

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js + Farcaster
- **Payments**: Stripe + Viem (Base blockchain)
- **AI**: Groq, OpenRouter, OpenAI, Gemini APIs
- **Deployment**: Vercel (frontend)

## 📦 Installation

```bash
# Clone repository
git clone <repository-url>
cd golden-base-ai-builder

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Configure your environment variables in .env.local
# See DEPLOYMENT.md for full list

# Initialize database
npx prisma generate
npx prisma db push

# Seed database (optional - adds connectors)
npm run db:seed

# Start development server
npm run dev
```

Open http://localhost:3000

## 🔧 Environment Variables

Required variables (see `.env.example` for full list):

```bash
DATABASE_URL=postgresql://...
GROQ_API_KEY=gsk_...
OPENROUTER_API_KEY=sk-or-...
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
ADMIN_FID=1378286
```

## 📚 Project Structure

```
golden-base-ai-builder/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   │   ├── builder/       # AI app builder
│   │   │   ├── apps/          # User's apps
│   │   │   ├── billing/       # Subscription & credits
│   │   │   ├── connectors/    # Connector marketplace
│   │   │   ├── marketplace/   # App marketplace
│   │   │   ├── settings/      # User settings
│   │   │   └── admin/         # Admin dashboard
│   │   ├── api/               # API routes
│   │   ├── login/             # Authentication page
│   │   ├── pricing/           # Pricing page
│   │   └── page.tsx          # Landing page
│   ├── components/            # React components
│   │   ├── dashboard/        # Dashboard components
│   │   └── ui/              # Reusable UI components
│   ├── lib/                  # Utilities and services
│   │   ├── ai.ts            # AI service layer
│   │   ├── db.ts            # Prisma client
│   │   ├── stripe.ts        # Stripe integration
│   │   └── crypto.ts        # Base crypto utilities
│   └── types/               # TypeScript types
├── packages/
│   ├── config/              # Platform configuration
│   └── db/                 # Prisma schema and seeds
└── public/                 # Static assets
```

## 🎯 Key Features

### AI App Builder
- Natural language app generation
- Multiple AI provider support
- Live preview functionality
- Code export as HTML/React

### Credit System
- All platform features require credits
- Subscription tiers include monthly credits
- One-time credit packs available
- Usage tracking and history

### Admin Dashboard
- Full platform analytics
- User management
- Revenue tracking
- Marketplace approval
- Connector revenue payouts

### Marketplace
- Browse and install apps
- Submit custom apps
- Connector marketplace
- Revenue sharing (60% developer, 40% platform)

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Start (Vercel)

```bash
npm i -g vercel
vercel login
vercel --prod
```

Configure environment variables in Vercel dashboard.

## 👤 Admin Access

**Admin User** (FID: 1378286, username: urbanwarrior79)
- FREE unlimited access to all features
- FREE unlimited app creation and deployment
- FREE unlimited AI generation (all providers)
- FREE unlimited connector usage
- Full admin dashboard access
- View all user data and platform analytics
- Approve/reject marketplace submissions
- Manage connector earnings payouts

## 💰 Payment Collection

**Platform Wallet**: `0xcc9569bF1d87B7a18BD3363413b823AaF06084d3`

- All Stripe payouts route to this wallet
- All crypto payments (USDC/ETH on Base) route to this wallet
- All Farcaster Frames payments route to this wallet
- 40% platform revenue share from connector marketplace
- Admin can withdraw anytime via dashboard

## 📖 Documentation

- [Deployment Guide](DEPLOYMENT.md)
- [API Documentation](API.md)
- [CTO Guide](CTO_GUIDE.md)
- [Changes Summary](CHANGES_SUMMARY.md)

## 🧪 Testing

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Email**: support@goldenbase.ai
- **Farcaster**: @urbanwarrior79
- **Issues**: GitHub Issues

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma for the excellent ORM
- Stripe for payment infrastructure
- Farcaster community
- AI providers: Groq, OpenRouter, OpenAI, Gemini

---

Built with ❤️ for the Farcaster and Base ecosystem

# Golden Base AI Builder v2.0

**Free AI APIs • Low-Cost Subscriptions • Multiple Payments • 20+ Connectors • Open Marketplace**

An AI-powered platform to build, deploy, and manage onchain miniapps with built-in token deployment. Built on **Zo Space**.

![Golden Base AI Builder](https://img.shields.io/badge/Zo%20Space-Deployed-blue) ![Version](https://img.shields.io/badge/Version-2.0.0-purple) ![Status](https://img.shields.io/badge/Status-Production%20Ready-green)

## 🌟 New Features v2.0

### 💰 Free AI APIs First
- **Groq** - Ultra-fast Llama models (default, free)
- **OpenRouter** - Multi-model access with free tier
- **OpenAI GPT-4** - Premium option (Growth+)
- **Claude 3 Opus** - Enterprise option (Pro+)
- Smart fallback: Free APIs → Paid APIs automatically

### 💳 Subscription Tiers
| Tier | Price | Credits/Month | Apps | AI Models | Connectors |
|------|-------|---------------|------|-----------|------------|
| Starter | $1.99 | 500 | 3 | Groq, OpenRouter | 5 |
| Growth | $4.99 | 2,000 | 10 | + GPT-4 | 15 |
| Pro | $9.99 | 5,000 | 25 | + Claude | 50 |
| Enterprise | $29.99 | 15,000 | 100 | Priority | Unlimited |

### 🏦 Multiple Payment Methods
- **Stripe** - Credit card payments
- **Crypto** - ETH/USDC on Base
- **Farcaster Frames** - One-tap payments
- **Credits** - In-app credit system

### 🔌 20+ Connectors with OAuth
**Development Platforms:**
- Vercel, Netlify, Cloudflare Pages, Supabase

**Developer Tools:**
- GitHub, Linear, Notion, Slack, Discord

**Crypto & DeFi:**
- Coinbase, Alchemy, Infura, QuickNode, Moralis, Covalent, Dune Analytics, The Graph

**Payments & Storage:**
- Stripe, AWS S3, IPFS

### 🏪 Open Marketplace
- Submit apps and connectors
- Rating and review system
- Developer earnings (60% revenue share)
- Trending algorithms
- Farcaster/BaseApp integration

## 🚀 Live Demo

- **Builder**: https://goldmine.zo.space/builder
- **Templates**: https://goldmine.zo.space/templates
- **Subscription**: https://goldmine.zo.space/subscription
- **Marketplace**: https://goldmine.zo.space/marketplace
- **Dapp**: https://goldmine.zo.space/dapp
- **Explore**: https://goldmine.zo.space/explore

## 📡 API Endpoints

### Builder APIs
| Endpoint | Method | Description | Credits |
|----------|--------|-------------|---------|
| `/api/generate-app` | POST | Generate app (Groq by default) | 50 |
| `/api/edit` | POST | Edit app code | 25 |
| `/api/preview` | GET | Get app code for preview | - |
| `/api/templates` | GET | List available templates | - |
| `/api/export` | POST | Export app code | - |
| `/api/deploy` | POST | Deploy to Vercel | - |

### Subscription APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/subscription/tier` | GET | Get all tiers |
| `/api/subscription/current` | GET | Get user's current subscription |
| `/api/subscription/subscribe` | POST | Start subscription (Stripe) |
| `/api/subscription/cancel` | POST | Cancel subscription |
| `/api/subscription/webhook` | POST | Stripe webhook handler |

### Payment APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payment/packages` | GET | Get credit packages |
| `/api/payment/methods` | GET | List payment methods |
| `/api/payment/purchase` | POST | Purchase credits |
| `/api/payment/verify` | POST | Verify crypto payment |
| `/api/payment/balance` | GET | Get user credit balance |

### Connector APIs
| Endpoint | Method | Description | Cost |
|----------|--------|-------------|------|
| `/api/connectors` | GET | List all connectors | - |
| `/api/connectors/categories` | GET | Get connector categories | - |
| `/api/connectors/:id` | GET | Get connector details | - |
| `/api/connectors/:id/authorize` | POST | Start OAuth flow | - |
| `/api/connectors/:id/callback` | GET | OAuth callback | - |
| `/api/connectors/:id/use` | POST | Use connector | Variable |
| `/api/connectors/user/authorized` | GET | List authorized connectors | - |

### Marketplace APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/marketplace` | GET | Browse marketplace |
| `/api/marketplace/trending` | GET | Get trending items |
| `/api/marketplace/:id` | GET | Get listing details |
| `/api/marketplace/:id/reviews` | GET | Get reviews |
| `/api/marketplace/:id/review` | POST | Submit review |
| `/api/marketplace/submit` | POST | Submit listing |
| `/api/marketplace/developer/earnings` | GET | Get earnings |
| `/api/marketplace/developer/payout` | POST | Request payout |

### Token APIs (Flaunch)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/deploy-token` | POST | Deploy token via Flaunch |
| `/api/auth` | POST | Authenticate via Farcaster |

### DeFi APIs (GoldenSwap)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/prices` | GET | Get token prices |
| `/api/pool/[pair]` | GET | Get pool data |
| `/api/create-pool` | POST | Create liquidity pool |
| `/api/swap` | POST | Swap tokens |
| `/api/stake` | POST | Stake tokens |
| `/api/farm` | POST | Farm yields |

## 🔧 Configuration

### Required Secrets (Zo Space Settings > Advanced)

| Secret | Description | Required |
|--------|-------------|----------|
| `GROQ_API_KEY` | Groq API key for free AI | ✅ Yes |
| `OPENROUTER_API_KEY` | OpenRouter API key | ✅ Yes |
| `OPENAI_API_KEY` | OpenAI for premium AI | Optional |
| `ANTHROPIC_API_KEY` | Anthropic Claude | Optional |
| `STRIPE_SECRET_KEY` | Stripe payments | Optional |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhooks | Optional |
| `STRIPE_PRICE_STARTER` | Starter price ID | Optional |
| `STRIPE_PRICE_GROWTH` | Growth price ID | Optional |
| `STRIPE_PRICE_PRO` | Pro price ID | Optional |
| `STRIPE_PRICE_ENTERPRISE` | Enterprise price ID | Optional |
| `PLATFORM_PRIVATE_KEY` | Platform wallet for crypto | Optional |
| `PLATFORM_WALLET_ADDRESS` | Wallet address for payments | Optional |
| `FLAUNCH_API_KEY` | Token deployment | No |
| `VERCEL_TOKEN` | Vercel deployment | Optional |

### OAuth Secrets (for Connectors)

For each connector, you need:
- `{CONNECTOR}_CLIENT_ID` - OAuth client ID
- `{CONNECTOR}_CLIENT_SECRET` - OAuth client secret

Example: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

## 🏗️ Architecture

```
Golden Base AI Builder v2.0
├── Core Features
│   ├── AI Generation (Groq/OpenRouter → OpenAI/Claude)
│   ├── Template Library
│   ├── Live Preview
│   └── Code Export
│
├── Subscription System
│   ├── Tier Management (4 tiers)
│   ├── Credit System
│   └── Payment Integration
│
├── Payment Methods
│   ├── Stripe (Credit Cards)
│   ├── Crypto (ETH/USDC on Base)
│   ├── Farcaster Frames
│   └── Credits
│
├── Connectors (20+)
│   ├── OAuth Flow Management
│   ├── Usage Tracking
│   └── Revenue Sharing (60/40)
│
├── Marketplace
│   ├── App/Connector Listings
│   ├── Reviews & Ratings
│   ├── Developer Earnings
│   └── Payout System
│
└── Integrations
    ├── Flaunch (Token Deployment)
    ├── Vercel (App Hosting)
    ├── Farcaster (Social)
    └── Base (Blockchain)
```

## 📝 Quick Start

### 1. Install Dependencies
```bash
bun install
```

### 2. Initialize Database
```bash
bun run db:init
```

### 3. Set Environment Variables
```bash
export GROQ_API_KEY=your_groq_key
export OPENROUTER_API_KEY=your_openrouter_key
# ... other env vars
```

### 4. Start Development Server
```bash
bun run dev
```

## 💰 Pricing & Credits

### Credit Costs

| Action | Credits |
|--------|---------|
| Generate app (Groq) | 50 |
| Generate app (GPT-4) | 300 |
| Generate app (Claude) | 400 |
| Edit app (Groq) | 25 |
| Edit app (GPT-4) | 150 |
| Edit app (Claude) | 200 |
| Connector usage | 10-100 (varies) |

### Credit Packages

| Credits | Stripe | Crypto (USDC) |
|---------|--------|---------------|
| 500 | $4.99 | $5.00 |
| 1,000 | $8.99 | $9.00 |
| 2,500 | $19.99 | $20.00 |
| 5,000 | $34.99 | $35.00 |
| 10,000 | $59.99 | $60.00 |

## 🔌 Connector Development

### Creating a New Connector

1. Define connector in `src/services/connectors/registry.ts`:
```typescript
{
  id: 'myconnector',
  name: 'My Connector',
  description: '...',
  category: 'dev',
  icon: 'M',
  version: '1.0.0',
  pricePerUse: 50,
  oauthVersion: '2.0',
  authUrl: 'https://...',
  tokenUrl: 'https://...',
  scope: ['read', 'write'],
  developerShare: 60
}
```

2. Add OAuth secrets to environment:
```bash
export MYCONNECTOR_CLIENT_ID=xxx
export MYCONNECTOR_CLIENT_SECRET=xxx
```

3. Submit to marketplace:
```bash
POST /api/marketplace/submit
{
  "type": "connector",
  "title": "My Connector",
  "description": "...",
  "price": 0,
  "category": "dev",
  "tags": ["api", "integration"]
}
```

### Revenue Sharing
- **Connector Developer**: 60% of credit cost
- **Platform**: 40% of credit cost

## 📊 Analytics

Track app usage:
```typescript
POST /api/analytics
{
  "id": "app_123",
  "type": "view" // or "install", "share"
}
```

Get trending apps:
```typescript
GET /api/trending
```

## 🔒 Security

- OAuth tokens stored encrypted
- Stripe webhook signature verification
- Crypto transaction verification on Base
- Credit system prevents injection attacks
- Rate limiting on all APIs

## 🚢 Deployment on Zo Space

1. Push code to GitHub
2. Connect repository to Zo Space
3. Set required secrets in Zo Space dashboard
4. Deploy with `bun run build`
5. Configure custom domain

## 📄 License

MIT License - See LICENSE file

## 👤 Owner

- **Farcaster**: @mcmillianeugene (FID: 1378286)
- **Base Wallet**: 0x1F1d87B7a18BD3363413b823AaF06084d3

## 🔄 Migration from v1.0

If upgrading from v1.0:

1. **Database**: New SQLite database replaces in-memory storage
   - Run `bun run db:init` to create tables
   - Existing apps will be lost (export them first)

2. **AI APIs**: Switched to free-first approach
   - Add `GROQ_API_KEY` and `OPENROUTER_API_KEY`
   - Existing OpenAI usage will now cost credits

3. **Authentication**: FID-based auth remains
   - User accounts now persist in database

4. **Payments**: New subscription system
   - Users can now purchase credits
   - Subscriptions provide monthly credits

## 📚 Documentation

- [API Documentation](./API.md) - Complete API reference
- [CTO Guide](./CTO_GUIDE.md) - Technical implementation details
- [Connector Development Guide](./docs/CONNECTORS.md) - Build custom connectors
- [Payment Integration Guide](./docs/PAYMENTS.md) - Payment methods setup
- [Marketplace Documentation](./docs/MARKETPLACE.md) - Marketplace integration

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines before submitting PRs.

## 📞 Support

- **Farcaster**: @mcmillianeugene
- **Issues**: GitHub Issues
- **Email**: support@goldenbase.ai

---

*Built with ❤️ on Zo Space • v2.0 - Free AI APIs, Subscriptions, Payments, Marketplace*

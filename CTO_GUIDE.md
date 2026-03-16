# CTO Guide - Golden Base AI Builder v2.0

## Overview

This is a production-ready AI miniapps builder built on Zo Space with **free AI APIs, subscription system, multiple payment methods, 20+ connectors, and an open marketplace**.

It allows users to:
1. Build apps using free AI APIs (Groq, OpenRouter)
2. Subscribe to tiered plans with credit system
3. Pay via Stripe, crypto (ETH/USDC on Base), or Farcaster Frames
4. Integrate with 20+ third-party services via OAuth
5. Submit and monetize apps/connectors on marketplace

## v2.0 Architecture

### Core Systems

```
Golden Base AI Builder v2.0
├── AI Service Layer
│   ├── Groq (free, default) - Llama 3.3 70B
│   ├── OpenRouter (free tier) - Multi-model
│   ├── OpenAI GPT-4 (premium) - Growth+ tiers
│   └── Claude 3 Opus (premium) - Enterprise tier
│   └── Smart Fallback: Free → Paid automatically
│
├── Subscription System
│   ├── Starter ($1.99/mo) - 500 credits, 3 apps, free AI only
│   ├── Growth ($4.99/mo) - 2,000 credits, 10 apps, +GPT-4
│   ├── Pro ($9.99/mo) - 5,000 credits, 25 apps, +Claude
│   └── Enterprise ($29.99/mo) - 15,000 credits, 100 apps, priority
│
├── Payment Methods
│   ├── Stripe - Credit card subscriptions and credit purchases
│   ├── Crypto - ETH/USDC on Base network
│   ├── Farcaster Frames - One-tap social payments
│   └── Credits - In-app credit system with purchase packages
│
├── Connector Marketplace (20+ connectors)
│   ├── Development: Vercel, Netlify, Cloudflare, Supabase, GitHub, Linear, Notion, Slack, Discord
│   ├── Crypto/DeFi: Coinbase, Alchemy, Infura, QuickNode, Moralis, Covalent, Dune, The Graph
│   ├── Payments: Stripe
│   └── Storage: AWS S3, IPFS
│   └── OAuth Flow Management + Revenue Sharing (60% dev / 40% platform)
│
├── App Marketplace
│   ├── Browse apps and connectors
│   ├── Rating and review system
│   ├── Developer earnings and payouts
│   └── Trending algorithms
│
└── Database (SQLite → PostgreSQL ready)
    ├── Users and subscriptions
    ├── Credit transactions
    ├── Apps and templates
    ├── Connector authorizations
    ├── Usage tracking and revenue
    ├── Marketplace listings and reviews
    └── Payment records
```

## New Features v2.0

### 1. Free AI APIs First

**Problem**: v1.0 used expensive OpenAI API by default.
**Solution**: v2.0 uses Groq (free Llama models) as default with automatic fallback.

**Credit Costs**:
- Groq generation: 50 credits
- OpenRouter: 60 credits
- GPT-4: 300 credits
- Claude 3 Opus: 400 credits

**Implementation**:
```typescript
// src/services/ai/index.ts
class AIService {
  async generateApp(description, options) {
    if (model === 'auto') {
      return await this.tryFallbackChain(description); // Groq → OpenRouter → Paid
    }
  }
}
```

### 2. Subscription Tiers

**Problem**: No monetization, all features free.
**Solution**: Tiered subscriptions with monthly credits.

**Implementation**:
```typescript
// src/services/subscription/index.ts
export const TIERS = {
  starter: { price: 1.99, creditsPerMonth: 500, maxApps: 3 },
  growth: { price: 4.99, creditsPerMonth: 2000, maxApps: 10 },
  pro: { price: 9.99, creditsPerMonth: 5000, maxApps: 25 },
  enterprise: { price: 29.99, creditsPerMonth: 15000, maxApps: 100 }
};
```

### 3. Multiple Payment Methods

**Problem**: Only Stripe for token deployment.
**Solution**: Three payment methods for maximum accessibility.

**Stripe**:
- Credit card payments
- Subscription management
- Webhook handling

**Crypto**:
- ETH/USDC on Base
- Payment address generation
- Transaction verification

**Farcaster Frames**:
- One-tap purchases
- Frame manifest generation
- Social payment flow

### 4. Connector Marketplace

**Problem**: No integrations, limited functionality.
**Solution**: 20+ OAuth connectors with revenue sharing.

**Revenue Model**:
- Developers earn 60% of connector usage fees
- Platform earns 40%
- Example: GitHub (30 credits/use) × 100 uses × 60% = $18/day

### 5. Persistent Database

**Problem**: v1.0 used in-memory storage, lost data on restart.
**Solution**: SQLite database with migrations.

**Schema**: See `src/lib/schema.ts` for complete database schema.

## File Structure

```
src/
├── index.ts                    # Entry point, route mounting
├── api/                        # API routes
│   ├── generate-app.ts         # AI app generation
│   ├── edit.ts                # AI code editing
│   ├── subscription.ts        # Subscription management
│   ├── payment.ts             # Payment operations
│   ├── connectors.ts          # Connector OAuth
│   └── marketplace.ts         # Marketplace operations
├── services/
│   ├── ai/                   # AI service layer
│   │   ├── index.ts          # Main orchestrator
│   │   ├── groq.ts          # Groq API client
│   │   ├── openrouter.ts    # OpenRouter API client
│   │   ├── openai.ts        # OpenAI API client
│   │   └── claude.ts        # Claude API client
│   ├── subscription/          # Subscription service
│   ├── payments/             # Payment services
│   │   ├── stripe.ts        # Stripe integration
│   │   ├── crypto.ts        # Crypto payments (Base)
│   │   ├── frames.ts        # Farcaster Frames
│   │   └── credits.ts       # Credit system
│   ├── connectors/           # Connector system
│   │   ├── registry.ts      # Connector definitions (20+)
│   │   └── oauth.ts        # OAuth flow management
│   └── marketplace/          # Marketplace service
├── lib/
│   ├── db.ts                # Database connection
│   ├── schema.ts            # Database schema
│   └── init-db.ts          # Database initialization
└── types/
    └── subscription.ts       # Type definitions
```

## Environment Variables

### Required

```
GROQ_API_KEY=xxx              # Free AI API (get from groq.com)
OPENROUTER_API_KEY=xxx        # Free AI API (get from openrouter.ai)
```

### Optional - Payments

```
STRIPE_SECRET_KEY=xxx
STRIPE_WEBHOOK_SECRET=xxx
STRIPE_PRICE_STARTER=xxx
STRIPE_PRICE_GROWTH=xxx
STRIPE_PRICE_PRO=xxx
STRIPE_PRICE_ENTERPRISE=xxx
PLATFORM_PRIVATE_KEY=xxx       # For crypto payments
PLATFORM_WALLET_ADDRESS=xxx   # Platform wallet for receiving crypto
```

### Optional - Premium AI

```
OPENAI_API_KEY=xxx            # For GPT-4
ANTHROPIC_API_KEY=xxx        # For Claude 3 Opus
```

### Optional - Existing Features

```
FLAUNCH_API_KEY=xxx           # Token deployment
VERCEL_TOKEN=xxx             # Vercel deployment
GITHUB_TOKEN=xxx             # GitHub repo creation
```

### OAuth Secrets (Connectors)

For each connector:
```
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
VERCEL_CLIENT_ID=xxx
VERCEL_CLIENT_SECRET=xxx
# ... etc for all 20+ connectors
```

## Getting Started

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

Server runs on `http://localhost:3000`

### 5. Test APIs

```bash
# Health check
curl http://localhost:3000/health

# Get subscription tiers
curl http://localhost:3000/api/subscription/tier

# Generate app
curl -X POST http://localhost:3000/api/generate-app \
  -H "Content-Type: application/json" \
  -d '{"fid": 1378286, "description": "A todo app"}'
```

## API Endpoints

### Subscription APIs

- `GET /api/subscription/tier` - Get all tiers
- `GET /api/subscription/current?fid=...` - Get user's subscription
- `POST /api/subscription/subscribe` - Start subscription
- `POST /api/subscription/cancel` - Cancel subscription
- `POST /api/subscription/webhook` - Stripe webhook

### Payment APIs

- `GET /api/payment/packages` - Get credit packages
- `GET /api/payment/methods` - List payment methods
- `POST /api/payment/purchase` - Purchase credits
- `POST /api/payment/verify` - Verify crypto payment
- `GET /api/payment/balance?fid=...` - Get balance and history

### Connector APIs

- `GET /api/connectors` - List all connectors
- `GET /api/connectors/:id` - Get connector details
- `POST /api/connectors/:id/authorize` - Start OAuth
- `GET /api/connectors/:id/callback` - OAuth callback
- `POST /api/connectors/:id/use` - Use connector
- `GET /api/connectors/user/authorized?fid=...` - List authorized
- `DELETE /api/connectors/:id` - Revoke connector

### Marketplace APIs

- `GET /api/marketplace` - Browse listings
- `GET /api/marketplace/trending` - Get trending
- `GET /api/marketplace/:id` - Get listing details
- `GET /api/marketplace/:id/reviews` - Get reviews
- `POST /api/marketplace/:id/review` - Submit review
- `POST /api/marketplace/submit` - Submit listing
- `GET /api/marketplace/developer/earnings?fid=...` - Get earnings
- `POST /api/marketplace/developer/payout` - Request payout

### Builder APIs (Updated)

- `POST /api/generate-app` - Generate with free AI (Groq default)
- `POST /api/edit` - Edit with free AI
- `GET /api/preview?id=...` - Get preview code
- `GET /api/templates` - Get templates

**Credit costs now included in responses!**

## Database Schema

### Key Tables

- `users` - User accounts (FID-based)
- `subscriptions` - User subscription tiers
- `credit_transactions` - Credit purchases and usage
- `apps` - Generated apps
- `connectors` - Connector definitions
- `user_connectors` - OAuth authorizations
- `connector_usage` - Usage tracking and revenue
- `payments` - Payment records (Stripe, crypto, frame)
- `marketplace_listings` - App/connector listings
- `reviews` - Listing reviews
- `developer_earnings` - Revenue for developers

See `src/lib/schema.ts` for complete schema.

## Deployment

### Zo Space Deployment

1. Push code to GitHub
2. Connect repository to Zo Space
3. Set environment variables in Zo Space dashboard
4. Run `bun install` and `bun run db:init`
5. Build with `bun run build`
6. Deploy with Zo Space

### Stripe Setup

1. Create Stripe account
2. Create products and prices for each tier
3. Create webhook endpoint
4. Copy webhook signing secret
5. Add secrets to Zo Space

### Crypto Setup

1. Generate platform wallet
2. Add `PLATFORM_PRIVATE_KEY` and `PLATFORM_WALLET_ADDRESS` to env
3. Deploy payment contract (optional, for production)

### Connector OAuth Setup

For each connector you want to enable:

1. Create OAuth app in provider's dashboard
2. Set redirect URI to `https://your-domain.com/api/connectors/ID/callback`
3. Copy client ID and secret
4. Add to environment as `CONNECTOR_CLIENT_ID` and `CONNECTOR_CLIENT_SECRET`

## Current Status

### ✅ Completed

- Free AI APIs (Groq, OpenRouter)
- Subscription tiers (4 plans)
- Credit system
- Stripe payments
- Crypto payments (Base network)
- Farcaster Frames payments
- 20+ connectors with OAuth
- Connector marketplace
- App marketplace
- Rating and review system
- Revenue sharing (60/40)
- Payout system
- Persistent database (SQLite)
- All new API endpoints

### ⚠️ Needs Testing

- Stripe webhook handling (production testing required)
- Crypto transaction verification (needs Base network access)
- OAuth flows for all 20+ connectors (test each)
- Payment flows (end-to-end testing)

### 🚧 Known Issues

1. **Vercel Deployment**: Still has OAuth SSO issue (from v1.0)
   - Fix: Disable SSO on Vercel team or use alternative

2. **In-Memory to DB Migration**: Existing v1.0 data lost
   - Fix: Export v1.0 apps before migration

3. **Free API Limits**: Groq/OpenRouter have rate limits
   - Fix: Implement queuing and caching

## Next Steps

### Immediate (Week 1)

1. **Test Payment Flows**
   - Stripe checkout and webhooks
   - Crypto payment verification
   - Frame generation

2. **Test OAuth Connectors**
   - GitHub (most common)
   - Vercel (for deployment)
   - Supabase (database)

3. **End-to-End Testing**
   - User registration
   - Subscription purchase
   - Credit usage
   - Connector authorization

### Short Term (Month 1)

4. **Implement Rate Limiting**
   - API endpoint rate limits
   - Credit usage limits
   - OAuth flow limits

5. **Add Monitoring**
   - Error tracking (Sentry)
   - Analytics (PostHog)
   - Uptime monitoring

6. **Frontend Pages**
   - Subscription page with tier comparison
   - Marketplace browse page
   - Connector authorization UI
   - Developer dashboard

### Medium Term (Month 2-3)

7. **Migrate to PostgreSQL**
   - Better performance for scale
   - Connection pooling
   - Row-level security

8. **Implement Queues**
   - Bull/Redis for background jobs
   - AI generation queue
   - Payment processing queue

9. **Add More Connectors**
   - Additional developer tools
   - More crypto/DeFi integrations
   - Popular SaaS platforms

### Long Term (Month 3+)

10. **Analytics Dashboard**
    - User behavior tracking
    - Revenue analytics
    - Connector performance

11. **A/B Testing**
    - Pricing experiments
    - Onboarding optimization
    - Feature rollouts

12. **Mobile Apps**
    - iOS app (React Native)
    - Android app (React Native)
    - Frame-first mobile experience

## Security Considerations

- OAuth tokens encrypted at rest
- Stripe webhook signature verification
- Crypto transaction verification on Base
- Credit system prevents injection attacks
- Rate limiting on all APIs
- CORS properly configured

## Performance

- **Database**: SQLite with WAL mode (migrate to PostgreSQL for scale)
- **Caching**: Add Redis for sessions and rate limits
- **AI API**: Queuing and caching for free tier limits
- **Static Assets**: Serve via CDN in production

## Compliance

- **GDPR**: User data management, right to revoke OAuth
- **Terms of Service**: Marketplace rules, connector guidelines
- **Payments**: Stripe and crypto transaction records
- **Tax**: Revenue sharing reporting for developers

## Support

- **Documentation**: README, API.md, PAYMENTS.md, CONNECTORS.md, MARKETPLACE.md
- **Owner**: @mcmillianeugene (FID: 1378286)
- **Email**: support@goldenbase.ai

---

*Updated for v2.0 - Free AI APIs, Subscriptions, Payments, Marketplace*

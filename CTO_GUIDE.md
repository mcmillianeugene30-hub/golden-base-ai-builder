# CTO Guide - Golden Base AI Builder

## Overview

This is a production-ready AI miniapps builder built on Zo Space. It allows users to:
1. Build apps using natural language
2. Deploy tokens on Base via Flaunch
3. Create DeFi dapps (swap, stake, farm)
4. Generate Frame manifests for farcaster

## The Original Vision

### Phase 1: The Builder Platform ✅
Create a "Vercel for miniapps" where users describe apps in natural language and get fully functional onchain apps.

**What's Built:**
- Landing page showcasing features
- AI-powered builder with chat interface
- Template gallery (Todo, Counter, Game, Marketplace, etc.)
- Live preview with iframe embedding
- Code export functionality

**Files:** `/`, `/builder`, `/templates`, `/preview`

### Phase 2: Token Economy ✅
Integrate Flaunch API to allow users to launch tokens with revenue sharing.

**What's Built:**
- Token deployment via Flaunch (ERC-20 on Base)
- Revenue manager: 80% creator / 20% platform split
- Fair launch mechanism (no wallet required)

**Files:** `/api/deploy-token`, `/api/auth`

### Phase 3: DeFi Infrastructure ✅
Build GoldenSwap - a full-featured DeFi dapp.

**What's Built:**
- Token swap functionality
- Liquidity pool creation
- Yield farming
- Staking rewards
- Price tracking

**Files:** `/dapp`, `/api/swap`, `/api/stake`, `/api/farm`, `/api/prices`, `/api/pool`, `/api/create-pool`

### Phase 4: Social Integration ✅
Connect with farcaster ecosystem.

**What's Built:**
- Auto-connect for farcaster users (FID-based auth)
- Frame manifest generation
- Twitter/Warpcast sharing buttons
- Analytics tracking

**Files:** `/api/farcaster-auth`, `/api/frame-manifest`, `/api/analytics`

### Phase 5: Deployment & Distribution ⚠️
Deploy miniapps to the world.

**What's Built:**
- Vercel API integration (needs OAuth fix)
- GitHub repository creation API

**What's NOT Working:**
- Vercel deployment returns 401 (SSO protection issue)
- Need to fix OAuth flow or switch to alternative

## Current Issues & Fixes Needed

### Issue 1: Vercel Deployment Not Working
**Problem:** Returns 401 Unauthorized
**Cause:** Your Vercel team has SSO protection enabled
**Fix Options:**
1. Disable SSO on Vercel team (recommended)
2. Use Vercel CLI with proper OAuth
3. Switch to alternative hosting (Netlify, Cloudflare Pages)
4. Host directly on Zo Space (requires Pro plan)

### Issue 2: In-Memory Storage
**Problem:** Apps are stored in memory, lost on restart
**Fix:** Add persistent storage:
- SQLite (local file)
- PostgreSQL (external DB)
- Zo Datasets integration

### Issue 3: Mock DeFi
**Problem:** Swap/Stake/Farm are simulated
**Fix:** Integrate real contracts:
- Uniswap V3/V2 forks
- Aave lending
- Custom staking contracts

### Issue 4: No User Auth
**Problem:** No persistent user accounts
**Fix:** Add authentication:
- Privy integration (recommended for crypto)
- Wallet-based auth (MetaMask, Coinbase Wallet)
- Social auth (Google, Twitter, farcaster)

## Code Structure

The routes are stored in Zo Space database. To modify:

```typescript
// Page route example (/builder)
import { useState } from "react";

export default function Builder() {
  const [prompt, setPrompt] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const generateApp = async () => {
    setLoading(true);
    const res = await fetch('/api/generate-app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: prompt })
    });
    const data = await res.json();
    setCode(data.app.code);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      {/* Builder UI */}
    </div>
  );
}
```

```typescript
// API route example (/api/generate-app)
import type { Context } from "hono";

export default async (c: Context) => {
  const { description, template } = await c.req.json();

  let code = "";
  if (template) {
    // Load from template
    code = getTemplate(template);
  } else {
    // Use AI to generate
    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: 'Generate a React component...'
        }, {
          role: 'user',
          content: description
        }]
      })
    });
    // Parse AI response
  }

  const appId = 'app_' + Date.now();
  apps[appId] = { id: appId, code, name: 'Generated App' };

  return c.json({ success: true, app: apps[appId] });
};

// In-memory store (needs fixing)
const apps: Record<string, any> = {};
```

## Environment Variables Needed

| Variable | Description | Required |
|----------|-------------|----------|
| `FLAUNCH_API_KEY` | Token deployment | No (API is open) |
| `OPENAI_API_KEY` | Code generation | Yes |
| `ANTHROPIC_API_KEY` | Code generation (alt) | Optional |
| `VERCEL_TOKEN` | App deployment | Optional |
| `VERCEL_TEAM_ID` | Vercel team | Optional |
| `GROQ_API_KEY` | Fast generation | Optional |

## Zo Space Specifics

- Routes are stored in database, not files
- Use `update_space_route()` to create/edit routes
- API routes are always public
- Page routes need `public: true` for no-auth access
- Max response size: ~1MB
- Runtime: Bun + Hono + React

## Next Steps for Production

1. **Fix Vercel OAuth** - Critical for app deployment
2. **Add Database** - Use SQLite or external DB for persistence
3. **User Accounts** - Add proper auth system
4. **Real Contracts** - Replace mock DeFi with real smart contracts
5. **Payment Integration** - Stripe for premium features
6. **Analytics** - Track user behavior properly

## Contact

- **Owner:** @mcmillianeugene (FID: 1378286)
- **Base Wallet:** 0x1F1d87B7a18BD3363413b823AaF06084d3

---

*This guide was generated to help CTO.New understand the original vision and continue building.*

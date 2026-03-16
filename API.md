# Golden Base AI Builder v2.0 - API Documentation

Complete API reference for the Golden Base AI Builder with free AI APIs, subscriptions, payments, connectors, and marketplace.

## Authentication

Most endpoints require FID (Farcaster ID) for authentication:

```json
{
  "fid": 1378286
}
```

## Subscription APIs

### GET /api/subscription/tier
Get all available subscription tiers.

**Response:**
```json
{
  "success": true,
  "tiers": [
    {
      "name": "Starter",
      "price": 1.99,
      "creditsPerMonth": 500,
      "maxApps": 3,
      "features": ["Free AI generation (Groq, OpenRouter)", "3 apps per month"],
      "aiModels": ["groq", "openrouter"],
      "connectorLimit": 5
    }
  ]
}
```

### GET /api/subscription/current?fid=1378286
Get user's current subscription and credit balance.

**Response:**
```json
{
  "success": true,
  "subscription": {
    "id": 1,
    "userId": 1,
    "tier": "growth",
    "status": "active",
    "creditsPerMonth": 2000
  },
  "creditBalance": {
    "userId": 1,
    "balance": 1500,
    "monthlyCredits": 2000,
    "totalPurchased": 3000,
    "totalUsed": 1500,
    "tier": "growth"
  },
  "availableModels": ["groq", "openrouter", "gpt-4"]
}
```

### POST /api/subscription/subscribe
Start a subscription (Stripe checkout).

**Request:**
```json
{
  "fid": 1378286,
  "tier": "growth",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_..."
}
```

### POST /api/subscription/cancel
Cancel active subscription.

**Request:**
```json
{
  "fid": 1378286
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription canceled"
}
```

### POST /api/subscription/webhook
Handle Stripe webhooks (server-side).

**Headers:**
```
stripe-signature: t=...
```

**Body:** Stripe webhook payload

**Response:**
```json
{
  "success": true
}
```

## Payment APIs

### GET /api/payment/packages
Get available credit packages.

**Response:**
```json
{
  "success": true,
  "packages": [
    {
      "credits": 500,
      "stripePrice": 4.99,
      "cryptoUsdc": 5.0,
      "cryptoEth": 0.002
    }
  ]
}
```

### GET /api/payment/methods
Get available payment methods.

**Response:**
```json
{
  "success": true,
  "methods": [
    {
      "id": "stripe",
      "name": "Credit Card",
      "icon": "💳",
      "supported": true
    },
    {
      "id": "crypto",
      "name": "Crypto (ETH/USDC)",
      "icon": "🪙",
      "supported": true
    },
    {
      "id": "frame",
      "name": "Farcaster Frame",
      "icon": "🖼️",
      "supported": true
    }
  ]
}
```

### POST /api/payment/purchase
Purchase credits.

**Request (Stripe):**
```json
{
  "fid": 1378286,
  "credits": 1000,
  "method": "stripe",
  "email": "user@example.com"
}
```

**Request (Crypto):**
```json
{
  "fid": 1378286,
  "credits": 1000,
  "method": "crypto",
  "currency": "usdc"
}
```

**Request (Frame):**
```json
{
  "fid": 1378286,
  "credits": 1000,
  "method": "frame",
  "currency": "usdc"
}
```

**Response (Stripe):**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

**Response (Crypto):**
```json
{
  "success": true,
  "paymentAddress": "0x1F1d87B7a18BD3363413b823AaF06084d3",
  "amount": "9.0"
}
```

**Response (Frame):**
```json
{
  "success": true,
  "frameUrl": "https://goldmine.zo.space/api/frame/manifest/123"
}
```

### POST /api/payment/verify
Verify crypto payment transaction.

**Request:**
```json
{
  "fid": 1378286,
  "txHash": "0xabc123...",
  "method": "crypto"
}
```

**Response:**
```json
{
  "success": true,
  "creditsAdded": 1000
}
```

### GET /api/payment/balance?fid=1378286
Get user's credit balance and transaction history.

**Response:**
```json
{
  "success": true,
  "balance": {
    "userId": 1,
    "balance": 1500,
    "monthlyCredits": 2000,
    "totalPurchased": 3000,
    "totalUsed": 1500,
    "tier": "growth"
  },
  "transactions": [
    {
      "id": 1,
      "amount": 2000,
      "type": "subscription",
      "description": "Monthly credits for Growth plan",
      "createdAt": "2024-03-16T10:00:00Z"
    },
    {
      "id": 2,
      "amount": -50,
      "type": "usage",
      "description": "App generation (groq)",
      "createdAt": "2024-03-16T11:00:00Z"
    }
  ]
}
```

## Connector APIs

### GET /api/connectors
List all available connectors.

**Query Parameters:**
- `category`: Filter by category (dev, crypto, storage, payment, social, analytics)

**Response:**
```json
{
  "success": true,
  "connectors": [
    {
      "id": "github",
      "name": "GitHub",
      "description": "Access repositories, issues, and PRs",
      "category": "dev",
      "icon": "⌘",
      "pricePerUse": 30
    }
  ]
}
```

### GET /api/connectors/categories
Get connector categories.

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "id": "dev",
      "name": "Development",
      "count": 8
    },
    {
      "id": "crypto",
      "name": "Crypto & DeFi",
      "count": 8
    }
  ]
}
```

### GET /api/connectors/:id
Get specific connector details.

**Response:**
```json
{
  "success": true,
  "connector": {
    "id": "github",
    "name": "GitHub",
    "description": "Access repositories, issues, and PRs",
    "category": "dev",
    "icon": "⌘",
    "pricePerUse": 30,
    "scope": ["repo", "read:org"]
  }
}
```

### POST /api/connectors/:id/authorize
Initiate OAuth flow for connector.

**Request:**
```json
{
  "fid": 1378286
}
```

**Response:**
```json
{
  "success": true,
  "authUrl": "https://github.com/login/oauth/authorize?client_id=...&state=...",
  "state": "abc123..."
}
```

### GET /api/connectors/:id/callback?code=...&fid=1378286
OAuth callback handler (redirected to automatically).

**Response:** Redirects to marketplace with success/error

### POST /api/connectors/:id/use
Use connector (deducts credits).

**Request:**
```json
{
  "fid": 1378286,
  "action": "create_repository"
}
```

**Response:**
```json
{
  "success": true,
  "creditsUsed": 30
}
```

**Error:**
```json
{
  "success": false,
  "error": "Insufficient credits"
}
```

### GET /api/connectors/user/authorized?fid=1378286
Get user's authorized connectors.

**Response:**
```json
{
  "success": true,
  "connectors": [
    {
      "id": "github",
      "name": "GitHub",
      "category": "dev",
      "icon": "⌘",
      "authorizedAt": "2024-03-16T10:00:00Z"
    }
  ]
}
```

### DELETE /api/connectors/:id
Revoke connector authorization.

**Request:**
```json
{
  "fid": 1378286
}
```

**Response:**
```json
{
  "success": true
}
```

## Marketplace APIs

### GET /api/marketplace
Browse marketplace listings.

**Query Parameters:**
- `type`: Filter by type (app, connector)
- `category`: Filter by category
- `search`: Search in title and description
- `limit`: Number of results (max 100, default 20)
- `offset`: Pagination offset

**Response:**
```json
{
  "success": true,
  "listings": [
    {
      "id": 1,
      "type": "app",
      "userId": 1,
      "title": "Crypto Portfolio Tracker",
      "description": "Track your crypto portfolio in real-time",
      "price": 0,
      "category": "crypto",
      "tags": ["defi", "portfolio"],
      "imageUrl": "https://...",
      "downloads": 150,
      "views": 1200,
      "rating": 4.8,
      "reviewCount": 25,
      "status": "published",
      "createdAt": "2024-03-16T10:00:00Z",
      "updatedAt": "2024-03-16T10:00:00Z"
    }
  ],
  "count": 1
}
```

### GET /api/marketplace/trending?limit=10
Get trending listings (last 7 days).

**Response:**
```json
{
  "success": true,
  "trending": [...]
}
```

### GET /api/marketplace/:id
Get listing details (increments view count).

**Response:**
```json
{
  "success": true,
  "listing": {
    "id": 1,
    "type": "app",
    "userId": 1,
    "title": "Crypto Portfolio Tracker",
    "description": "...",
    "price": 0,
    "category": "crypto",
    "tags": ["defi", "portfolio"],
    "imageUrl": "https://...",
    "downloads": 150,
    "views": 1201,
    "rating": 4.8,
    "reviewCount": 25,
    "status": "published",
    "createdAt": "2024-03-16T10:00:00Z",
    "updatedAt": "2024-03-16T10:00:00Z"
  }
}
```

### GET /api/marketplace/:id/reviews
Get listing reviews.

**Response:**
```json
{
  "success": true,
  "reviews": [
    {
      "id": 1,
      "listingId": 1,
      "userId": 2,
      "rating": 5,
      "comment": "Amazing app!",
      "createdAt": "2024-03-16T12:00:00Z"
    }
  ]
}
```

### POST /api/marketplace/:id/review
Submit or update review.

**Request:**
```json
{
  "fid": 1378286,
  "rating": 5,
  "comment": "Great app!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review submitted"
}
```

### POST /api/marketplace/submit
Submit app or connector to marketplace.

**Request (App):**
```json
{
  "fid": 1378286,
  "type": "app",
  "appId": 123,
  "title": "My Awesome App",
  "description": "This app does amazing things...",
  "price": 0,
  "category": "crypto",
  "tags": ["defi", "nft"],
  "imageUrl": "https://example.com/image.png"
}
```

**Request (Connector):**
```json
{
  "fid": 1378286,
  "type": "connector",
  "connectorId": "myconnector",
  "title": "My Connector",
  "description": "...",
  "price": 0,
  "category": "dev",
  "tags": ["api"],
  "imageUrl": "https://..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Listing submitted for review",
  "listingId": 456
}
```

### GET /api/marketplace/developer/earnings?fid=1378286
Get developer earnings.

**Response:**
```json
{
  "success": true,
  "earnings": {
    "totalEarned": 450.00,
    "pendingPayouts": 150.00,
    "transactions": [
      {
        "id": 1,
        "amount": 150.00,
        "payoutStatus": "pending",
        "createdAt": "2024-03-16T10:00:00Z"
      },
      {
        "id": 2,
        "amount": 300.00,
        "payoutStatus": "paid",
        "createdAt": "2024-03-01T10:00:00Z"
      }
    ]
  }
}
```

### POST /api/marketplace/developer/payout
Request payout.

**Request (Stripe):**
```json
{
  "fid": 1378286,
  "amount": 150,
  "method": "stripe"
}
```

**Request (Crypto):**
```json
{
  "fid": 1378286,
  "amount": 100,
  "method": "crypto",
  "address": "0x123..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payout requested"
}
```

### GET /api/marketplace/categories/list
Get marketplace categories.

**Query Parameters:**
- `type`: Filter by type (app, connector)

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "name": "crypto",
      "count": 25
    }
  ]
}
```

## Builder APIs

### POST /api/generate-app
Generate a new app from description or template (updated to use free AI APIs).

**Request:**
```json
{
  "fid": 1378286,
  "description": "A clicker game where you earn coins",
  "template": "clicker", // optional - use template instead of description
  "model": "groq" // optional: groq, openrouter, gpt-4, claude-3-opus, auto (default)
}
```

**Response:**
```json
{
  "success": true,
  "app": {
    "id": "app_123456789",
    "name": "Clicker Game",
    "code": "export default function App() { ... }",
    "hasContract": false
  },
  "response": "I've created a clicker game app for you!",
  "creditsRemaining": 450
}
```

**Credit Costs:**
- Groq: 50 credits
- OpenRouter: 60 credits
- GPT-4: 300 credits
- Claude 3 Opus: 400 credits

### GET /api/preview?id={appId}
Get app code for preview embedding.

**Response:**
```json
{
  "success": true,
  "code": "export default function App() { ... }",
  "name": "My App"
}
```

### POST /api/edit
Edit app code via natural language.

**Request:**
```json
{
  "appId": "app_123",
  "code": "export default function App() { return <div>Hello</div> }",
  "change": "make the background blue and add a button"
}
```

**Response:**
```json
{
  "success": true,
  "code": "export default function App() { return <div className='bg-blue-600'>...</div> }",
  "response": "I've updated the app with a blue background and button!"
}
```

### GET /api/templates
List available templates.

**Response:**
```json
{
  "templates": [
    {
      "id": "todo",
      "name": "Todo List",
      "description": "Task management app",
      "icon": "check-circle"
    },
    {
      "id": "counter",
      "name": "Counter",
      "description": "Simple counter with increments",
      "icon": "plus-circle"
    }
  ]
}
```

### POST /api/export
Export app as downloadable code.

**Request:**
```json
{
  "name": "My App",
  "code": "export default function App() { ... }"
}
```

**Response:**
```json
{
  "success": true,
  "appName": "My App",
  "files": {
    "App.tsx": "...",
    "package.json": "..."
  },
  "downloadUrl": "..."
}
```

### POST /api/deploy
Deploy app to Vercel (requires VERCEL_TOKEN and VERCEL_TEAM_ID).

**Request:**
```json
{
  "appId": "myapp",
  "name": "My App",
  "code": "export default function App() { ... }"
}
```

**Response:**
```json
{
  "success": true,
  "appId": "myapp",
  "url": "https://myapp-xxx.vercel.app",
  "deployUrl": "..."
}
```

---

## Token APIs

### POST /api/deploy-token
Deploy ERC-20 token via Flaunch API.

**Request:**
```json
{
  "name": "Golden Coin",
  "symbol": "GOLD",
  "description": "The golden token",
  "creatorAddress": "0x123..." // Optional - uses platform wallet
}
```

**Response:**
```json
{
  "success": true,
  "name": "Golden Coin",
  "symbol": "GOLD",
  "launchId": 55279,
  "tokenAddress": "0x...",
  "blockchain": "base",
  "statusUrl": "https://web2-api.flaunch.gg/api/v1/launch-status/55279",
  "message": "Token launched! 80% to creator, 20% to platform."
}
```

### POST /api/auth
Authenticate user via FID.

**Request:**
```json
{
  "fid": 1378286,
  "address": "0x123..."
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "fid": 1378286,
    "username": "eugene",
    "isOwner": true
  },
  "message": "Owner authenticated"
}
```

---

## DeFi APIs

### GET /api/prices
Get token prices.

**Response:**
```json
{
  "success": true,
  "prices": {
    "ETH": { "usd": 3450.00, "change": 2.5 },
    "GOLD": { "usd": 0.0024, "change": -1.2 },
    "VINI": { "usd": 0.15, "change": 5.8 }
  },
  "timestamp": 1773600757056
}
```

### POST /api/create-pool
Create liquidity pool.

**Request:**
```json
{
  "tokenA": "ETH",
  "tokenB": "GOLD",
  "amountA": "1",
  "amountB": "10000",
  "wallet": "0x123..."
}
```

**Response:**
```json
{
  "success": true,
  "pool": {
    "tokenA": "ETH",
    "tokenB": "GOLD",
    "reserveA": "1",
    "reserveB": "10000",
    "lpToken": "0x..."
  },
  "message": "Pool ETH/GOLD created!"
}
```

### POST /api/swap
Swap tokens.

**Request:**
```json
{
  "fromToken": "ETH",
  "toToken": "GOLD",
  "amount": "1",
  "wallet": "0x123..."
}
```

**Response:**
```json
{
  "success": true,
  "fromToken": "ETH",
  "toToken": "GOLD",
  "fromAmount": "1",
  "toAmount": "9500",
  "rate": "0.95",
  "txHash": "0x..."
}
```

### POST /api/stake
Stake tokens.

**Request:**
```json
{
  "token": "GOLD",
  "amount": "100",
  "wallet": "0x123..."
}
```

**Response:**
```json
{
  "success": true,
  "staked": "100",
  "rewards": "0",
  "txHash": "0x..."
}
```

### POST /api/farm
Farm yields.

**Request:**
```json
{
  "pair": "ETH/GOLD",
  "amount": "10",
  "wallet": "0x123..."
}
```

**Response:**
```json
{
  "success": true,
  "farmed": "10",
  "pendingRewards": "0.5",
  "txHash": "0x..."
}
```

---

## Social APIs

### GET /api/frame-manifest
Generate Frame manifest.

**Query:** `?name=MyApp&appId=app_123&url=https://...`

**Response:**
```json
{
  "manifest": {
    "protocol": "farcaster",
    "name": "MyApp",
    "icon": 3448,
    "description": "Built with Golden Base AI Builder",
    "imageUrl": "https://...",
    "postUrl": "https://goldmine.zo.space/api/frame-manifest",
    "actions": [
      {
        "label": "Launch",
        "action": "post"
      }
    ]
  }
}
```

### POST /api/farcaster-auth
Authenticate via FID.

**Request:**
```json
{
  "fid": 1378286
}
```

**Response:**
```json
{
  "success": true,
  "fid": 1378286,
  "address": "0x...",
  "message": "Wallet connected"
}
```

---

## Analytics APIs

### GET/POST /api/analytics
Track app analytics.

**Request:**
```json
{
  "id": "app_123",
  "type": "view" // or "install", "share"
}
```

**Response:**
```json
{
  "success": true,
  "views": 1
}
```

### GET /api/trending
Get trending apps.

**Response:**
```json
{
  "success": true,
  "trending": [
    { "id": "demo", "name": "Demo App", "views": 150, "installs": 45 }
  ]
}
```

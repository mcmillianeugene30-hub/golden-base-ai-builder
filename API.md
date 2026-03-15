# Golden Base AI Builder - API Documentation

## Builder APIs

### POST /api/generate-app
Generate a new app from description or template.

**Request:**
```json
{
  "description": "A clicker game where you earn coins",
  "template": "clicker" // optional - use template instead of description
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
  "response": "I've created a clicker game app for you! You can preview it now."
}
```

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

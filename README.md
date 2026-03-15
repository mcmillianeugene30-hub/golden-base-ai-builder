# Golden Base AI Builder

An AI-powered platform to build, deploy, and manage onchain miniapps with built-in token deployment. Built on **Zo Space**.

![Golden Base AI Builder](https://img.shields.io/badge/Zo%20Space-Deployed-blue) ![Status](https://img.shields.io/badge/Status-Production%20Ready-green)

## 🌟 Features

### Core Builder
- **Natural Language App Generation** - Describe your app idea in plain English
- **Template Library** - Start from pre-built templates (Todo, Counter, Game, Marketplace, etc.)
- **Live Preview** - Real-time preview with iframe embedding
- **Code Export** - Download React/Vite code
- **Vercel Deployment** - One-click deploy to Vercel (requires OAuth setup)

### Token Features (via Flaunch API)
- **Token Deployment** - Deploy ERC-20 tokens on Base
- **Revenue Manager** - 80% creator / 20% platform fee split
- **Fair Launch** - No wallet required for users

### DeFi Features (GoldenSwap Dapp)
- **Token Swap** - Swap ETH/Base tokens
- **Liquidity Pools** - Create and add liquidity
- **Yield Farming** - Earn yields on LP tokens
- **Staking** - Stake tokens for rewards

### Social Features
- **Farcaster Integration** - Auto-connect for Warpcast users
- **Frame Manifest** - Generate Frames for farcaster
- **Social Sharing** - Twitter/Warpcast share buttons

## 🚀 Live Demo

- **Builder**: https://goldmine.zo.space/builder
- **Templates**: https://goldmine.zo.space/templates
- **Dapp**: https://goldmine.zo.space/dapp
- **Explore**: https://goldmine.zo.space/explore

## 📡 API Endpoints

### Builder APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate-app` | POST | Generate app from description or template |
| `/api/preview` | GET | Get app code for preview |
| `/api/edit` | POST | Edit app code via chat |
| `/api/templates` | GET | List available templates |
| `/api/export` | POST | Export app as downloadable code |
| `/api/deploy` | POST | Deploy to Vercel |
| `/api/frame-manifest` | GET | Generate Frame manifest |
| `/api/analytics` | GET/POST | Track app analytics |

### Token APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/deploy-token` | POST | Deploy token via Flaunch |
| `/api/auth` | POST | Authenticate via Farcaster |

### DeFi APIs
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

| Secret | Description |
|--------|-------------|
| `FLAUNCH_API_KEY` | Flaunch API key for token deployment |
| `VERCEL_TOKEN` | Vercel OAuth token for deployment |
| `VERCEL_TEAM_ID` | Vercel team ID |
| `GITHUB_TOKEN` | GitHub token for repo creation |
| `OPENAI_API_KEY` | OpenAI for code generation |
| `ANTHROPIC_API_KEY` | Anthropic Claude for code generation |

## 🏗️ Architecture

```
Golden Base AI Builder (Zo Space)
├── Pages
│   ├── /                 - Landing page
│   ├── /builder          - App builder with AI chat
│   ├── /templates        - Template gallery
│   ├── /preview          - Live app preview
│   ├── /apps            - User's apps dashboard
│   ├── /deploy          - Deploy settings
│   ├── /dapp            - GoldenSwap DeFi
│   └── /explore         - Trending apps
│
├── APIs
│   ├── Builder          - App generation, editing, export
│   ├── Token            - Flaunch integration
│   ├── DeFi             - Swap, stake, farm
│   └── Social           - Frame manifest, auth
│
└── External Integrations
    ├── Flaunch           - Token deployment
    ├── Vercel            - App hosting
    ├── OpenAI/Claude     - AI code generation
    └── Farcaster         - Social integration
```

## 📝 Original Plan

### Phase 1: Core Builder ✅
1. Landing page with feature showcase
2. AI-powered builder with chat interface
3. Template gallery
4. Live preview with iframe
5. Code export functionality

### Phase 2: Token Deployment ✅
1. Flaunch API integration
2. Revenue manager (80/20 split)
3. Token launch with fair launch
4. Platform fee collection

### Phase 3: DeFi Features ✅
1. GoldenSwap dapp
2. Token swap functionality
3. Liquidity pools
4. Yield farming
5. Staking

### Phase 4: Social Features ✅
1. Farcaster auto-connect
2. Frame manifest generation
3. Twitter/Warpcast sharing
4. Analytics tracking

### Phase 5: Deployment ⚠️
- Vercel deployment (requires OAuth - SSO protected)
- GitHub repository creation

## 🔄 Next Steps (For CTO/New Builder)

1. **Fix Vercel OAuth** - Set up proper Vercel app with correct scopes
2. **Production Database** - Add persistent storage for apps
3. **User Authentication** - Add full auth system
4. **Smart Contract Integration** - Add actual DeFi contracts
5. **NFT Support** - Add ERC-721/1155 deployment

## 📄 License

MIT License - See LICENSE file

## 👤 Owner

- **Farcaster**: @mcmillianeugene (FID: 1378286)
- **Base Wallet**: 0x1F1d87B7a18BD3363413b823AaF06084d3

---

*Built with ❤️ on Zo Space*

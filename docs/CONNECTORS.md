# Connector Development Guide

## Overview

The Golden Base AI Builder supports 20+ connectors that integrate with third-party services via OAuth. Developers can create custom connectors and monetize them through the marketplace.

## Connector Architecture

### Base Interface

Every connector must implement this interface:

```typescript
interface ConnectorConfig {
  id: string;              // Unique identifier
  name: string;            // Display name
  description: string;     // User-facing description
  category: 'dev' | 'crypto' | 'storage' | 'payment' | 'social' | 'analytics';
  icon: string;            // Emoji or icon name
  version: string;         // Semantic version
  pricePerUse: number;     // Credits per use (10-100 recommended)
  oauthVersion: '1.0a' | '2.0' | 'none';
  authUrl: string;         // OAuth authorization URL
  tokenUrl: string;        // OAuth token exchange URL
  scope: string[];         // OAuth scopes
  developerShare: number;  // Revenue share % (60 default)
}
```

## Creating a New Connector

### Step 1: Register the Connector

Add your connector to `src/services/connectors/registry.ts`:

```typescript
export const CONNECTORS: Record<string, ConnectorConfig> = {
  // ... existing connectors
  
  myconnector: {
    id: 'myconnector',
    name: 'My Service',
    description: 'Integrate with My Service API',
    category: 'dev',
    icon: 'M',
    version: '1.0.0',
    pricePerUse: 50,
    oauthVersion: '2.0',
    authUrl: 'https://myservice.com/oauth/authorize',
    tokenUrl: 'https://myservice.com/oauth/token',
    scope: ['read', 'write'],
    developerShare: 60
  }
};
```

### Step 2: Configure OAuth

Add environment variables for your connector:

```bash
MYCONNECTOR_CLIENT_ID=your_client_id
MYCONNECTOR_CLIENT_SECRET=your_client_secret
```

In Zo Space, add these secrets in Settings > Advanced.

### Step 3: Implement OAuth Flow

The platform handles OAuth 1.0a and 2.0 automatically. Your connector just needs proper endpoints:

1. **Authorization URL**: Where users are redirected to grant permission
2. **Token URL**: Where we exchange authorization code for access token
3. **Scopes**: What permissions the connector needs

### Step 4: Test the Connector

1. Start development server:
   ```bash
   bun run dev
   ```

2. Navigate to `/marketplace`

3. Find your connector and click "Connect"

4. Complete OAuth flow

5. Test usage:
   ```bash
   POST /api/connectors/myconnector/use
   {
     "fid": 1378286,
     "action": "test_action"
   }
   ```

### Step 5: Submit to Marketplace

```bash
POST /api/marketplace/submit
{
  "fid": 1378286,
  "type": "connector",
  "connectorId": "myconnector",
  "title": "My Service Connector",
  "description": "Full description...",
  "price": 0,
  "category": "dev",
  "tags": ["api", "integration"],
  "imageUrl": "https://..."
}
```

## Pricing Guidelines

### Credit Cost Recommendations

| Category | Recommended Credits |
|----------|-------------------|
| Simple API calls | 10-25 |
| Data operations | 25-50 |
| Actions/Write operations | 50-100 |
| Complex operations | 75-150 |

### Revenue Share

- **Default**: 60% connector developer, 40% platform
- **Tiered pricing** coming soon for premium connectors

## OAuth Flows

### OAuth 2.0 (Most Common)

```typescript
{
  oauthVersion: '2.0',
  authUrl: 'https://provider.com/oauth/authorize',
  tokenUrl: 'https://provider.com/oauth/token',
  scope: ['profile', 'email', 'read']
}
```

**Flow**:
1. User clicks "Connect"
2. Redirect to `authUrl` with `client_id`, `redirect_uri`, `response_type=code`, `scope`, `state`
3. User approves
4. Redirect back with `code` and `state`
5. Exchange `code` for `access_token` at `tokenUrl`
6. Store encrypted token in database

### OAuth 1.0a

```typescript
{
  oauthVersion: '1.0a',
  authUrl: 'https://provider.com/oauth/authorize',
  tokenUrl: 'https://provider.com/oauth/token',
  scope: []
}
```

**Flow**:
1. Get request token
2. Redirect user to authorize
3. Get access token
4. Store token

### No OAuth (API Key)

```typescript
{
  oauthVersion: 'none',
  authUrl: '',
  tokenUrl: '',
  scope: []
}
```

Users provide API key manually (stored encrypted).

## Connector Categories

### Development (`dev`)
- Vercel, Netlify, Cloudflare Pages, Supabase
- GitHub, Linear, Notion

### Crypto & DeFi (`crypto`)
- Coinbase, Alchemy, Infura, QuickNode
- Moralis, Covalent, Dune, The Graph

### Storage (`storage`)
- AWS S3, IPFS, Cloudflare R2

### Payment (`payment`)
- Stripe, PayPal, Square

### Social (`social`)
- Slack, Discord, Twitter, Farcaster

### Analytics (`analytics`)
- Google Analytics, Mixpanel, Amplitude

## Security Best Practices

### 1. Token Storage
All OAuth tokens are encrypted at rest using:

```typescript
// Tokens stored in database as:
{
  access_token: "encrypted_token",
  refresh_token: "encrypted_refresh_token",
  token_expires_at: "ISO-8601-date"
}
```

### 2. Token Refresh
Tokens are automatically refreshed before expiration:

```typescript
if (Date.now() > tokenExpiresAt) {
  const newTokens = await refreshToken(refreshToken);
  // Update database with new tokens
}
```

### 3. Scope Limiting
Request only the minimum scopes needed:

```typescript
// Bad
scope: ['read', 'write', 'delete', 'admin']

// Good
scope: ['read:specific_resource']
```

### 4. Rate Limiting
All connector usage is rate-limited and credited:

```typescript
// Each use deducts credits
await deductCredits(userId, pricePerUse, description);
```

## Monetization

### Earning Potential

Based on your connector's `pricePerUse` and popularity:

```
Daily Earnings = (Daily Uses × Price Per Use) × 60%
```

**Example**:
- Connector: GitHub (30 credits/use)
- Daily uses: 100
- Daily earnings: 100 × 30 × 0.60 = 1,800 credits worth ~$18

### Payouts

Request payouts via API:

```bash
POST /api/marketplace/developer/payout
{
  "fid": 1378286,
  "amount": 1000,
  "method": "stripe",  // or "crypto"
  "address": "0x..."   // for crypto
}
```

### Dashboard

View your earnings at `/developer/dashboard`:
- Total earned
- Pending payouts
- Usage analytics
- Connector performance

## Example Connectors

### GitHub Connector

```typescript
github: {
  id: 'github',
  name: 'GitHub',
  description: 'Access repositories, issues, and PRs',
  category: 'dev',
  icon: '⌘',
  version: '1.0.0',
  pricePerUse: 30,
  oauthVersion: '2.0',
  authUrl: 'https://github.com/login/oauth/authorize',
  tokenUrl: 'https://github.com/login/oauth/access_token',
  scope: ['repo', 'read:org'],
  developerShare: 60
}
```

### IPFS Connector

```typescript
ipfs: {
  id: 'ipfs',
  name: 'IPFS',
  description: 'Decentralized file storage',
  category: 'storage',
  icon: '◐',
  version: '1.0.0',
  pricePerUse: 10,
  oauthVersion: 'none',  // No OAuth, uses API keys
  authUrl: '',
  tokenUrl: '',
  scope: [],
  developerShare: 60
}
```

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'bun:test';
import { getConnector } from './registry';

describe('MyConnector', () => {
  it('should return connector config', () => {
    const connector = getConnector('myconnector');
    expect(connector?.name).toBe('My Service');
  });

  it('should validate OAuth URLs', () => {
    const connector = getConnector('myconnector');
    expect(connector?.authUrl).toMatch(/^https:\/\//);
    expect(connector?.tokenUrl).toMatch(/^https:\/\//);
  });
});
```

### Integration Tests

Test the full OAuth flow:

```bash
# 1. Start test server
bun run dev

# 2. Initiate OAuth
curl -X POST http://localhost:3000/api/connectors/myconnector/authorize \
  -H "Content-Type: application/json" \
  -d '{"fid": 1378286}'

# 3. Follow authUrl and complete flow

# 4. Test usage
curl -X POST http://localhost:3000/api/connectors/myconnector/use \
  -H "Content-Type: application/json" \
  -d '{"fid": 1378286, "action": "test"}'
```

## Troubleshooting

### OAuth Fails

**Problem**: OAuth callback returns error

**Solution**:
- Check `CLIENT_ID` and `CLIENT_SECRET` are correct
- Verify `redirect_uri` matches what's registered with the OAuth provider
- Ensure `state` parameter is included and matches

### Token Expires

**Problem**: Connector stops working after a while

**Solution**:
- Check `refresh_token` is being returned
- Implement token refresh logic
- Monitor `token_expires_at` in database

### Credits Not Deducting

**Problem**: Connector usage doesn't charge credits

**Solution**:
- Verify connector is in `CONNECTORS` registry
- Check user has sufficient credits
- Review connector usage logs in database

## Support

- **Documentation**: See main README
- **Issues**: GitHub Issues
- **Farcaster**: @mcmillianeugene
- **Email**: connectors@goldenbase.ai

## Future Features

- [ ] Connector SDK for easier development
- [ ] Webhook support for event-driven connectors
- [ ] Bulk operations (batch API calls)
- [ ] Connector analytics dashboard
- [ ] Tiered pricing for premium connectors
- [ ] Connector marketplace search and filtering

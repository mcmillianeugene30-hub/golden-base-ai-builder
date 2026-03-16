# Payment Integration Guide

## Overview

The Golden Base AI Builder supports multiple payment methods:
- **Stripe** - Credit card payments
- **Crypto** - ETH and USDC on Base network
- **Farcaster Frames** - One-tap social payments
- **Credits** - In-app credit system

## Setup

### 1. Stripe Setup

#### Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and create account
2. Navigate to Dashboard > Developers > API keys
3. Copy `Secret key` (starts with `sk_test_` or `sk_live_`)

#### Configure Stripe Webhook

1. In Stripe Dashboard, go to Developers > Webhooks
2. Click "Add endpoint"
3. Enter URL: `https://your-domain.com/api/subscription/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
5. Copy webhook signing secret (starts with `whsec_`)

#### Create Products and Prices

For subscription tiers:

```bash
# Create products for each tier
stripe products create \
  --name="Starter Plan" \
  --description="500 credits/month, 3 apps"

stripe products create \
  --name="Growth Plan" \
  --description="2,000 credits/month, 10 apps"

stripe products create \
  --name="Pro Plan" \
  --description="5,000 credits/month, 25 apps"

stripe products create \
  --name="Enterprise Plan" \
  --description="15,000 credits/month, 100 apps"
```

```bash
# Create prices for each product (monthly)
stripe prices create \
  --product=prod_... \
  --unit-amount=199 \
  --currency=usd \
  --recurring="{\"interval\":\"month\"}" \
  --lookup-key="starter_monthly"

stripe prices create \
  --product=prod_... \
  --unit-amount=499 \
  --currency=usd \
  --recurring="{\"interval\":\"month\"}" \
  --lookup-key="growth_monthly"

# Repeat for pro ($9.99 = 999) and enterprise ($29.99 = 2999)
```

#### Add Environment Variables

In Zo Space Settings > Advanced:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_GROWTH=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ENTERPRISE=price_...
```

### 2. Crypto Setup (Base Network)

#### Generate Platform Wallet

```bash
# Use viem to create wallet
bun -e "
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const privateKey = generatePrivateKey();
const account = privateKeyToAccount(privateKey);

console.log('Private Key:', privateKey);
console.log('Address:', account.address);
"
```

#### Add Environment Variables

```
PLATFORM_PRIVATE_KEY=0x...
PLATFORM_WALLET_ADDRESS=0x...
```

#### Deploy Payment Contract (Optional)

For production, deploy a payment contract on Base to track transactions:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaymentProcessor {
    address public platformWallet;
    mapping(address => uint256) public payments;

    event PaymentReceived(address indexed from, uint256 amount);

    constructor(address _platformWallet) {
        platformWallet = _platformWallet;
    }

    receive() external payable {
        require(msg.value > 0, "Payment must be greater than 0");
        payments[msg.sender] += msg.value;
        emit PaymentReceived(msg.sender, msg.value);
    }

    function withdraw() external {
        require(msg.sender == platformWallet, "Only platform wallet can withdraw");
        payable(platformWallet).transfer(address(this).balance);
    }
}
```

### 3. Farcaster Frames Setup

Frames work automatically with the base URLs. No additional setup needed.

#### Test Frame

Generate a payment frame:

```bash
POST /api/payment/purchase
{
  "fid": 1378286,
  "credits": 1000,
  "method": "frame"
}
```

Response:
```json
{
  "success": true,
  "frameUrl": "https://goldmine.zo.space/api/frame/manifest/123"
}
```

## Payment Flow

### Subscription Flow (Stripe)

1. User selects tier
2. Create checkout session:
   ```typescript
   POST /api/subscription/subscribe
   {
     "fid": 1378286,
     "tier": "pro",
     "email": "user@example.com"
   }
   ```
3. User is redirected to Stripe checkout
4. User completes payment
5. Stripe webhook fires
6. Subscription created, credits added

### Credit Purchase Flow (Stripe)

1. User selects credit package
2. Create checkout session:
   ```typescript
   POST /api/payment/purchase
   {
     "fid": 1378286,
     "credits": 1000,
     "method": "stripe",
     "email": "user@example.com"
   }
   ```
3. User completes payment
4. Webhook adds credits to account

### Credit Purchase Flow (Crypto)

1. User selects credit package and currency (ETH/USDC)
2. Generate payment address:
   ```typescript
   POST /api/payment/purchase
   {
     "fid": 1378286,
     "credits": 1000,
     "method": "crypto",
     "currency": "usdc"
   }
   ```
3. Response includes platform address and amount
4. User sends payment to address
5. User verifies transaction:
   ```typescript
   POST /api/payment/verify
   {
     "fid": 1378286,
     "txHash": "0x...",
     "method": "crypto"
   }
   ```
6. Credits added after confirmation

### Frame Payment Flow

1. User generates payment frame
2. User opens frame in Warpcast
3. User taps "Buy Credits" button
4. Frame initiates transaction on Base
5. Transaction confirmed, credits added

## API Reference

### Create Subscription

```bash
POST /api/subscription/subscribe
Content-Type: application/json

{
  "fid": 1378286,
  "tier": "pro",
  "email": "user@example.com"
}
```

Response:
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/...",
  "sessionId": "cs_..."
}
```

### Purchase Credits

```bash
POST /api/payment/purchase
Content-Type: application/json

{
  "fid": 1378286,
  "credits": 1000,
  "method": "stripe",
  "email": "user@example.com"
}
```

Response:
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

### Get Payment Methods

```bash
GET /api/payment/methods
```

Response:
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

### Get Balance

```bash
GET /api/payment/balance?fid=1378286
```

Response:
```json
{
  "success": true,
  "balance": {
    "userId": 1,
    "balance": 2500,
    "monthlyCredits": 2000,
    "totalPurchased": 5000,
    "totalUsed": 2500,
    "tier": "growth"
  },
  "transactions": [
    {
      "id": 1,
      "amount": 2000,
      "type": "subscription",
      "description": "Monthly credits for Growth plan",
      "createdAt": "2024-03-16T10:00:00Z"
    }
  ]
}
```

## Security

### Stripe Webhook Verification

Webhooks are verified using Stripe signature:

```typescript
import crypto from 'crypto';

const signature = request.headers['stripe-signature'];
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const event = stripe.webhooks.constructEvent(
  payload,
  signature,
  webhookSecret
);
```

### Crypto Transaction Verification

Crypto payments are verified on Base blockchain:

```typescript
const client = createWalletClient({
  chain: base,
  transport: http()
}).extend(publicActions);

const tx = await client.getTransaction({
  hash: txHash
});

// Verify:
// - Recipient matches platform wallet
// - Amount is correct
// - Transaction is confirmed
```

### Fraud Prevention

1. **Rate Limiting**: Limit payment attempts per user
2. **Amount Validation**: Verify amounts against expected prices
3. **Transaction Monitoring**: Flag suspicious patterns
4. **Webhook Replay Protection**: Prevent duplicate webhook processing

## Troubleshooting

### Stripe Payment Fails

**Problem**: User sees payment error

**Solutions**:
- Check Stripe logs for detailed error
- Verify webhook is receiving events
- Ensure price IDs are correct
- Check webhook signing secret matches

### Crypto Payment Not Confirmed

**Problem**: Transaction sent but credits not added

**Solutions**:
- Verify transaction hash is correct
- Check Base block explorer for transaction status
- Ensure platform wallet address is correct
- Confirm amount matches expected price

### Webhook Not Received

**Problem**: Stripe payment completes but credits not added

**Solutions**:
- Check webhook URL is publicly accessible
- Verify webhook secret is correct
- Check Stripe webhook logs for delivery status
- Ensure server can handle POST requests from Stripe

## Testing

### Test Stripe Payments

Use Stripe test cards:

| Card Number | Use Case |
|-------------|----------|
| `4242 4242 4242 4242` | Success |
| `4000 0025 0000 3155` | Insufficient funds |
| `4000 0000 0000 9995` | Card declined |

### Test Crypto Payments

1. Use Base testnet for testing
2. Get testnet ETH from faucet
3. Send small test payments
4. Verify in database

### Test Frame Payments

1. Use Farcaster test frame URL
2. Create test frame with small amount
3. Open in Warpcast testnet
4. Complete transaction

## Pricing Configuration

### Subscription Tiers

Edit in `src/services/subscription/index.ts`:

```typescript
export const TIERS: Record<string, SubscriptionTier> = {
  starter: {
    name: 'Starter',
    price: 1.99,
    creditsPerMonth: 500,
    maxApps: 3,
    // ...
  },
  // ...
};
```

### Credit Packages

Edit in `src/services/payments/credits.ts`:

```typescript
getCreditPackages() {
  return [
    { credits: 500, stripePrice: 4.99, cryptoUsdc: 5.0, cryptoEth: 0.002 },
    // ...
  ];
}
```

## Support

- **Stripe Docs**: [stripe.com/docs](https://stripe.com/docs)
- **Viem Docs**: [viem.sh](https://viem.sh)
- **Farcaster Frames**: [frames.js.org](https://frames.js.org)
- **Issues**: GitHub Issues
- **Email**: payments@goldenbase.ai

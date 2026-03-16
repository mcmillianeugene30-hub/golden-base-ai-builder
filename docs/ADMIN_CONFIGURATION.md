# Admin Configuration

## Overview

The Golden Base AI Builder platform has been configured with an admin user that has special privileges for managing and testing the platform.

## Admin User Details

- **FID (Farcaster ID)**: 1378286
- **Username**: urbanwarrior79
- **Status**: Configured with FREE unlimited access

## Admin Privileges

The admin user has the following special privileges:

1. **Free Unlimited Access**: No subscription tier limitations
2. **Bypass Subscription Checks**: Can access all features regardless of subscription
3. **Bypass Credit Checks**: Can create/deploy apps without credit deductions
4. **Enterprise Tier Access**: Effective subscription tier with unlimited apps and credits

## Platform Revenue Configuration

### Payment Collection Wallet

All payments (Stripe, Crypto, Farcaster Frames) are collected at:

```
0xcc9569bF1d87B7a18BD3363413b823AaF06084d3
```

### Revenue Sharing

The platform uses a 40/60 revenue split:

- **Platform Share**: 40% of all payments
- **Creator/Developer Share**: 60% of all payments

This applies to:
- Credit purchases (Stripe, Crypto, Frames)
- Connector usage fees
- Marketplace transactions
- Subscription payments

## Configuration Files

### Main Admin Configuration

Location: `src/config/admin.ts`

```typescript
export const ADMIN_CONFIG = {
  // Admin user identification
  fid: 1378286,
  username: 'urbanwarrior79',

  // Admin privileges
  freeUnlimitedAccess: true,
  bypassSubscriptionChecks: true,
  bypassCreditChecks: true,

  // Platform wallet for receiving payments
  platformWalletAddress: '0xcc9569bF1d87B7a18BD3363413b823AaF06084d3',

  // Revenue sharing
  platformRevenueSharePercent: 40,
  creatorRevenueSharePercent: 60,
};
```

### Admin Service

Location: `src/services/admin/index.ts`

The admin service provides methods to:
- Check if a user is admin
- Verify admin privileges
- Get platform wallet address
- Calculate revenue splits
- Record platform and creator earnings

## API Endpoints

### Check Admin Status

```bash
GET /api/admin/status
```

Returns the current admin configuration.

### Check User Admin Status

```bash
GET /api/admin/check?fid=1378286
```

Returns whether a user is admin and their privileges.

### Calculate Revenue Split

```bash
POST /api/admin/revenue-split
Content-Type: application/json

{
  "amount": 100.00
}
```

Returns the revenue split for a payment amount.

## Payment Flow

1. **User makes payment** → Platform wallet receives funds
2. **Payment verified** → Credits added to user account
3. **Revenue split calculated** → 40% platform, 60% creator/developer
4. **Platform earnings recorded** → In developer_earnings table
5. **Creator earnings recorded** → For connectors/marketplace items

## Database Initialization

When the database is initialized, the admin user is automatically created:

```bash
bun run db:init
```

Output:
```
Admin user configured: FID 1378286, username urbanwarrior79
Platform wallet: 0xcc9569bF1d87B7a18BD3363413b823AaF06084d3
Platform revenue share: 40%
```

## Testing with Admin User

### Unlimited App Creation

The admin user can create unlimited apps without:

1. Checking subscription tier limits
2. Deducting credits
3. Requiring payment

### Connector Usage

The admin user can use connectors without:

1. Credit deductions
2. Subscription tier checks

However, usage is still tracked for analytics purposes.

## Security Considerations

- The admin configuration is hardcoded in `src/config/admin.ts`
- In production, consider moving sensitive values to environment variables
- The platform wallet private key should be stored securely (not in code)
- Admin checks are performed server-side only

## Updating Admin Configuration

To change admin configuration:

1. Edit `src/config/admin.ts`
2. Update the desired values
3. Restart the application
4. Reinitialize the database if changing FID/username: `bun run db:init`

## Monitoring Admin Activity

Admin usage is tracked in the database with special annotations:

- Credit transactions marked as "(Admin - no charge)"
- Usage records still created for analytics
- Platform earnings still calculated and recorded

## Platform Earnings

Platform earnings are recorded in the `developer_earnings` table with:

- `developer_id`: Admin user ID (represents platform)
- `amount`: Platform share of revenue (40%)
- `currency`: 'USD' (or equivalent value)
- `payout_status`: 'pending'
- `description`: Details about the earning source

## Troubleshooting

### Admin User Not Found

If the admin user doesn't exist in the database:

```bash
bun run db:init
```

This will create/ensure the admin user exists.

### Payments Not Going to Platform Wallet

Check that:
1. `src/config/admin.ts` has correct wallet address
2. Payment services import and use `adminService.getPlatformWalletAddress()`
3. Application restarted after config changes

### Revenue Split Incorrect

Verify:
1. `platformRevenueSharePercent` = 40
2. `creatorRevenueSharePercent` = 60
3. Revenue calculation uses admin service methods

## Additional Resources

- API Documentation: `API.md`
- CTO Guide: `CTO_GUIDE.md`
- Environment Variables: `.env.example`

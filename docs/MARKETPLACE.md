# Marketplace Documentation

## Overview

The Golden Base AI Builder Marketplace allows users to:
- Browse and discover apps and connectors
- Submit their own apps/connectors for distribution
- Rate and review listings
- Monetize their creations with 60% revenue share
- Request payouts for earnings

## Marketplace Features

### Listing Types

1. **Apps** - Complete miniapps built with the AI builder
2. **Connectors** - OAuth integrations with third-party services

### Categories

- **Development** - Tools and platforms
- **Crypto & DeFi** - Blockchain integrations
- **Storage** - File hosting solutions
- **Payments** - Payment processors
- **Social** - Community tools
- **Analytics** - Data and metrics

## API Endpoints

### Browse Marketplace

```bash
GET /api/marketplace?type=app&category=dev&limit=20&offset=0
```

Parameters:
- `type`: Filter by type (`app` or `connector`)
- `category`: Filter by category name
- `search`: Search in title and description
- `limit`: Number of results (max 100)
- `offset`: Pagination offset

Response:
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
      "tags": ["defi", "portfolio", "tracking"],
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

### Get Trending

```bash
GET /api/marketplace/trending?limit=10
```

Trending is calculated based on:
- Recent downloads (last 7 days)
- Rating and review count
- Engagement metrics

Response:
```json
{
  "success": true,
  "trending": [...]
}
```

### Get Listing Details

```bash
GET /api/marketplace/:id
```

Automatically increments view count.

Response:
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

### Submit Listing

```bash
POST /api/marketplace/submit
Content-Type: application/json

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

For connectors, use `connectorId` instead of `appId`.

Response:
```json
{
  "success": true,
  "message": "Listing submitted for review",
  "listingId": 456
}
```

### Get Reviews

```bash
GET /api/marketplace/:id/reviews
```

Response:
```json
{
  "success": true,
  "reviews": [
    {
      "id": 1,
      "listingId": 1,
      "userId": 2,
      "rating": 5,
      "comment": "Amazing app! Very useful.",
      "createdAt": "2024-03-16T12:00:00Z"
    }
  ]
}
```

### Submit Review

```bash
POST /api/marketplace/:id/review
Content-Type: application/json

{
  "fid": 1378286,
  "rating": 5,
  "comment": "Great app!"
}
```

Rating must be 1-5. Updates existing review if already submitted.

Response:
```json
{
  "success": true,
  "message": "Review submitted"
}
```

### Get Developer Earnings

```bash
GET /api/marketplace/developer/earnings?fid=1378286
```

Response:
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

### Request Payout

```bash
POST /api/marketplace/developer/payout
Content-Type: application/json

{
  "fid": 1378286,
  "amount": 150,
  "method": "stripe",
  "address": null
}
```

For crypto payouts, include address:

```json
{
  "fid": 1378286,
  "amount": 100,
  "method": "crypto",
  "address": "0x123..."
}
```

Response:
```json
{
  "success": true,
  "message": "Payout requested"
}
```

## Submitting to Marketplace

### Prepare Your App

1. **Build Your App**: Use the AI builder to create your app
2. **Test Thoroughly**: Ensure all features work correctly
3. **Create Preview**: Generate live preview link
4. **Prepare Screenshots**: Create compelling preview images
5. **Write Description**: Clear, detailed description
6. **Choose Category**: Select most relevant category
7. **Set Price**: 0 for free, or specify credit cost

### Prepare Your Connector

1. **Implement OAuth**: Follow connector development guide
2. **Test OAuth Flow**: Complete full authorization cycle
3. **Document Usage**: Provide clear usage examples
4. **Set Pricing**: Recommend 10-100 credits per use
5. **Choose Category**: Select appropriate category

### Submission Guidelines

#### Requirements
- Original content (no plagiarism)
- Functional and bug-free
- Clear description
- Appropriate category
- Preview image (recommended)

#### Prohibited Content
- Malicious code
- Copyrighted material
- Scams or fraud
- Explicit content
- Spam or low-quality listings

#### Approval Process
1. Submit listing → Status: `pending`
2. Review by moderators (24-48 hours)
3. If approved → Status: `published`
4. If rejected → Contacted with feedback

## Monetization

### Pricing Models

#### Free Listings (Price = 0)
- Users can use freely
- Developer earns from connector usage (if applicable)
- Good for building reputation

#### Paid Listings (Price > 0)
- Users pay credits to download/use
- Developer earns 60% of credit value
- Platform earns 40%

### Revenue Calculation

**Apps:**
```
Earnings = (Downloads × Price × 60%) / Credits_per_Dollar
```

Example:
- Price: 500 credits
- Downloads: 100
- Credit value: $0.01 per credit
- Earnings: 100 × 500 × 0.60 × 0.01 = $300

**Connectors:**
```
Earnings = (Uses × Price_Per_Use × 60%) / Credits_per_Dollar
```

Example:
- Price per use: 30 credits
- Daily uses: 100
- Credit value: $0.01 per credit
- Daily earnings: 100 × 30 × 0.60 × 0.01 = $18
- Monthly earnings: $18 × 30 = $540

### Payout Options

#### Stripe Payout
- Minimum: $50
- Processing time: 2-5 business days
- Available in 40+ countries

#### Crypto Payout
- Minimum: $20
- Processing time: 1-3 hours
- USDC on Base network

### Payout Schedule

Payouts are processed:
- **Auto-payout**: When pending amount reaches $200
- **Manual request**: Any time above minimum thresholds
- **Monthly**: All pending amounts on 1st of each month

## Ranking Algorithm

Trending and search results are ranked by:

### Score Components

1. **Popularity Score** (40%)
   - Recent downloads (last 7 days)
   - Page views
   - Install rate

2. **Quality Score** (35%)
   - Average rating
   - Number of reviews
   - Review sentiment

3. **Engagement Score** (15%)
   - Shares
   - Favorites
   - Time spent on page

4. **Freshness Score** (10%)
   - Recently updated
   - New listings boost

### Formula

```
Overall Score = (
  Popularity × 0.4 +
  Quality × 0.35 +
  Engagement × 0.15 +
  Freshness × 0.1
)
```

## Best Practices

### For App Developers

1. **Great Description**
   - Clear title that describes the app
   - Detailed description with use cases
   - Highlight key features
   - Include screenshots/video

2. **Optimal Pricing**
   - Research similar apps
   - Start free to build user base
   - Consider freemium model
   - Test different price points

3. **Continuous Updates**
   - Fix bugs quickly
   - Add requested features
   - Respond to reviews
   - Maintain high rating

4. **Promotion**
   - Share on Farcaster
   - Create demo videos
   - Get featured in collections
   - Engage with community

### For Connector Developers

1. **Clear Documentation**
   - Provide setup instructions
   - Include code examples
   - Document API endpoints
   - Troubleshooting guide

2. **Competitive Pricing**
   - Research similar connectors
   - Balance price with value
   - Consider usage tiers
   - Volume discounts for heavy users

3. **Reliability**
   - Monitor uptime
   - Handle errors gracefully
   - Provide status page
   - Support team contact

4. **Excellent Support**
   - Quick response times
   - Active on Farcaster
   - Regular updates
   - Community engagement

## Marketing Your Listing

### Before Launch
- Build beta testers community
- Get early reviews
- Create demo videos
- Prepare marketing materials
- Set up analytics

### Launch Day
- Announce on Farcaster
- Tweet about it
- Post in relevant communities
- Offer launch discount
- Reach out to influencers

### Ongoing Promotion
- Share updates regularly
- Respond to all reviews
- Create tutorials
- Partner with complementary listings
- Run promotional campaigns

## Analytics

### View Your Stats

Navigate to `/developer/dashboard` or use API:

```bash
GET /api/marketplace/developer/earnings?fid=1378286
```

### Metrics Tracked

- **Downloads**: Number of times your app was downloaded
- **Views**: Page views on your listing
- **Rating**: Average user rating
- **Reviews**: Number of reviews
- **Revenue**: Total earnings
- **Conversion Rate**: Downloads / Views

### Popular Listings

Check `/api/marketplace/trending` to see what's popular.

## Moderation

### Reporting a Listing

If you find a listing that violates guidelines:

1. Contact support
2. Include listing ID and reason
3. Provide evidence if applicable
4. Moderators will review within 24-48 hours

### Appeals

If your listing is rejected:
1. Review rejection reason
2. Fix the issues
3. Resubmit with improvements
4. Contact moderators for clarification

## Integration with Farcaster/BaseApp

### Farcaster Integration

- Auto-share new listings
- Generate frame for one-tap install
- FID-based authentication
- Social proof display

### BaseApp Integration

- Submit to BaseApp marketplace
- BaseApp-compatible manifests
- Analytics integration
- Revenue tracking sync

## Future Features

- [ ] Verified developer badges
- [ ] Featured listings (paid)
- [ ] Collections and bundles
- [ ] Affiliate program
- [ ] A/B testing for listings
- [ ] Advanced analytics dashboard
- [ ] In-app purchases
- [ ] Versioning support

## Support

- **Documentation**: Main README and other guides
- **Issues**: GitHub Issues
- **Farcaster**: @mcmillianeugene
- **Email**: marketplace@goldenbase.ai

## Legal

By submitting to the marketplace, you agree to:
- Content is original and you have rights to distribute
- Platform receives 40% of revenue
- Terms of service and privacy policy apply
- Content can be removed if guidelines violated

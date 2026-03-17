# Deployment Guide for GOLDEN BASE AI BUILDER

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase or Neon recommended)
- Stripe account with products configured
- AI API keys (Groq, OpenRouter, OpenAI, Gemini)
- Domain name configured

## Database Setup

### Option 1: Supabase
1. Create a new project at https://supabase.com
2. Get your database connection string from Settings > Database
3. Run Prisma migrations:
```bash
npx prisma generate
npx prisma db push
```

### Option 2: Neon (PostgreSQL)
1. Create a new project at https://neon.tech
2. Get your database connection string
3. Run migrations as above

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# AI Providers (Required for app generation)
GROQ_API_KEY=gsk_...
OPENROUTER_API_KEY=sk-or-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

# Payments (Required for subscriptions)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Products (Create these in Stripe Dashboard)
# 1. Subscription Products (Recurring):
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_GROWTH=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ENTERPRISE=price_...

# 2. Credit Pack Products (One-time):
STRIPE_PRICE_CREDITS_500=price_...
STRIPE_PRICE_CREDITS_1500=price_...
STRIPE_PRICE_CREDITS_3500=price_...
STRIPE_PRICE_CREDITS_8000=price_...

# Crypto (Base Network)
BASE_RPC_URL=https://base-mainnet.infura.io/v3/YOUR_KEY

# Admin Configuration
ADMIN_FID=1378286
ADMIN_USERNAME=urbanwarrior79

# Auth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.com

# Connectors OAuth (Optional - configure as needed)
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
VERCEL_CLIENT_ID=...
VERCEL_CLIENT_SECRET=...
NETLIFY_CLIENT_ID=...
NETLIFY_CLIENT_SECRET=...
NOTION_CLIENT_ID=...
NOTION_CLIENT_SECRET=...
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
COINBASE_CLIENT_ID=...
COINBASE_CLIENT_SECRET=...
```

## Stripe Setup

### Create Subscription Products

1. Go to Stripe Dashboard > Products > Add Product
2. Create subscription products for each tier:
   - **Starter**: $1.99/month, recurring
   - **Growth**: $4.99/month, recurring
   - **Pro**: $9.99/month, recurring
   - **Enterprise**: $29.99/month, recurring

3. For each product, create a price and copy the Price ID to your `.env`

### Create Credit Pack Products

1. Create one-time payment products:
   - **500 Credits**: $4.99
   - **1500 Credits**: $9.99
   - **3500 Credits**: $19.99
   - **8000 Credits**: $39.99

2. Copy each Price ID to your `.env`

### Configure Webhooks

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.deleted`

4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Local Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database (optional - adds connectors)
npm run db:seed

# Start development server
npm run dev
```

Open http://localhost:3000

## Production Deployment

### Frontend (Vercel)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login and deploy:
```bash
vercel login
vercel --prod
```

3. Configure environment variables in Vercel dashboard

### Backend (Railway/Fly.io)

The API routes run within Next.js, so no separate backend needed.

### Domain Configuration

1. Add your domain to Vercel
2. Update `NEXTAUTH_URL` in production
3. Update Stripe webhook endpoint
4. Configure OAuth redirect URLs for connectors

## Post-Deployment Checklist

- [ ] Database migrations completed successfully
- [ ] All environment variables configured
- [ ] Stripe products and webhooks set up
- [ ] AI API keys working
- [ ] OAuth redirect URLs configured (if using connectors)
- [ ] Admin account accessible (FID: 1378286)
- [ ] Test subscription flow
- [ ] Test credit pack purchases
- [ ] Test AI app generation
- [ ] Test crypto payments (optional)

## Monitoring

Set up error tracking and monitoring:

- **Vercel Analytics**: Built-in with Vercel
- **Stripe Dashboard**: Monitor payments and subscriptions
- **Database Monitoring**: Use Supabase/Neon dashboard
- **Logs**: Check Vercel deployment logs

## Security Notes

1. Never commit `.env.local` to git
2. Use strong `NEXTAUTH_SECRET` (generate with: `openssl rand -base64 32`)
3. Keep API keys secure
4. Enable Stripe webhook signature verification
5. Use HTTPS in production
6. Regularly update dependencies

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database allows remote connections
- Ensure Prisma client is generated

### Stripe Webhooks Failing
- Verify webhook URL is publicly accessible
- Check webhook secret matches
- Ensure events are selected

### AI Generation Not Working
- Verify API keys are valid
- Check credit balance in database
- Review logs for API errors

### Admin Access Not Working
- Verify `ADMIN_FID` and `ADMIN_USERNAME` match user data
- Check database for correct user creation
- Ensure user has `isAdmin: true`

## Support

For issues or questions:
- Email: support@goldenbase.ai
- Farcaster: @urbanwarrior79
- Documentation: Check `/docs` folder

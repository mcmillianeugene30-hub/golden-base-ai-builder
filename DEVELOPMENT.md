# Development Guide

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Initialize database:
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

4. Start development server:
```bash
npm run dev
```

## Code Structure

### API Routes (`src/app/api/`)
- `auth/` - Authentication endpoints (NextAuth)
- `ai/` - AI generation endpoints
- `billing/` - Subscription and credit pack purchases
- `payments/` - Crypto payment processing
- `apps/` - App CRUD operations
- `connectors/` - OAuth flows
- `marketplace/` - Marketplace operations
- `admin/` - Admin-only endpoints
- `webhooks/` - Stripe webhooks

### Components (`src/components/`)
- `dashboard/` - Dashboard-specific components
- `billing/` - Billing-related components
- `ui/` - Reusable UI components

### Services (`src/lib/`)
- `ai.ts` - AI service layer with multiple providers
- `stripe.ts` - Stripe integration
- `crypto.ts` - Base blockchain utilities
- `db.ts` - Prisma client

## Adding New Features

### Add a New AI Provider

1. Create provider class in `src/lib/ai.ts`:
```typescript
class NewProvider implements AIProvider {
  name = 'newprovider';
  async generate(prompt: string, options: any): Promise<string> {
    // Implementation
  }
  supportsModel(model: string): boolean {
    // Implementation
  }
}
```

2. Add to `AIService` constructor
3. Add to `fallbackOrder` array

### Add a New Connector

1. Add OAuth configuration to `.env.example`
2. Update connector list in `packages/db/seed.ts`
3. Add OAuth flow in `src/app/api/connectors/oauth/route.ts`
4. Add pricing in `packages/config/admin.ts`

### Add a New Subscription Tier

1. Update `SUBSCRIPTION_TIERS` in `packages/config/admin.ts`
2. Create Stripe product
3. Add price ID to `.env`
4. Update UI in `src/app/dashboard/billing/page.tsx`

## Testing

### Run Linter
```bash
npm run lint
```

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Database Operations

```bash
# View database in Prisma Studio
npm run db:studio

# Reset database (destructive)
npm run db:reset

# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push
```

## Common Patterns

### Protected API Route
```typescript
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Your code here
}
```

### Server Component with Data
```typescript
export default async function Page() {
  const session = await getServerSession(authOptions);

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  return <Component user={user} />;
}
```

### Client Component with API Call
```typescript
'use client';

export default function Component() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/endpoint')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  // Render UI
}
```

## Debugging

### View Logs
- Check Vercel deployment logs
- Use `console.log` in API routes
- Check browser console for client errors

### Database Issues
- Use Prisma Studio to inspect data
- Check `DATABASE_URL` is correct
- Verify migrations were applied

### AI Generation Issues
- Check API keys in `.env.local`
- Verify user has sufficient credits
- Review AI service logs

## Performance Optimization

### Database Queries
- Use `include` for relations
- Add indexes with `@@index` in Prisma schema
- Use `select` to limit returned fields

### Client-Side
- Use `useCallback` for event handlers
- Use `useMemo` for expensive computations
- Implement loading states

### API Routes
- Add proper error handling
- Use appropriate HTTP status codes
- Implement rate limiting (production)

## Security Best Practices

1. Never expose API keys in client code
2. Validate all user inputs
3. Use prepared statements for database queries
4. Implement rate limiting
5. Keep dependencies updated
6. Use environment variables for sensitive data

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions.

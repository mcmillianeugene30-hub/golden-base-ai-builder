import Stripe from 'stripe';
import { db } from './db';
import { SUBSCRIPTION_TIERS, CREDIT_PACKS } from '@/packages/config/admin';
import { ADMIN_CONFIG } from '@/packages/config/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export const createSubscriptionCheckoutSession = async (
  userId: string,
  tier: keyof typeof SUBSCRIPTION_TIERS
) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const tierConfig = SUBSCRIPTION_TIERS[tier];
  const priceId = process.env[`STRIPE_PRICE_${tier.toUpperCase()}`];

  if (!priceId) {
    throw new Error(`Stripe price ID not configured for tier: ${tier}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/billing?canceled=true`,
    metadata: {
      userId,
      tier,
    },
  });

  return session;
};

export const createCreditPackCheckoutSession = async (
  userId: string,
  pack: keyof typeof CREDIT_PACKS
) => {
  const user = await db.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  const packConfig = CREDIT_PACKS[pack];
  const priceId = process.env[`STRIPE_PRICE_CREDITS_${pack}`];

  if (!priceId) {
    throw new Error(`Stripe price ID not configured for pack: ${pack}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/billing?canceled=true`,
    metadata: {
      userId,
      credits: packConfig.credits.toString(),
      type: 'credit_pack',
    },
  });

  return session;
};

export const handleStripeWebhook = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata as any;

      if (metadata.type === 'credit_pack') {
        const credits = parseInt(metadata.credits, 10);
        await db.user.update({
          where: { id: metadata.userId },
          data: { credits: { increment: credits } },
        });

        await db.transaction.create({
          data: {
            userId: metadata.userId,
            type: 'credits_purchased',
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency?.toUpperCase() || 'USD',
            method: 'stripe',
            status: 'completed',
            stripePaymentId: session.payment_intent as string,
          },
        });
      } else if (metadata.tier) {
        const tier = metadata.tier as keyof typeof SUBSCRIPTION_TIERS;
        const tierConfig = SUBSCRIPTION_TIERS[tier];
        const subscriptionId = session.subscription as string;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        await db.subscription.upsert({
          where: { userId: metadata.userId },
          create: {
            userId: metadata.userId,
            tier,
            status: 'active',
            stripeSubscriptionId: subscriptionId,
            credits: tierConfig.credits,
            maxApps: tierConfig.maxApps,
            renewAt: new Date(subscription.current_period_end * 1000),
          },
          update: {
            tier,
            status: 'active',
            stripeSubscriptionId: subscriptionId,
            credits: tierConfig.credits,
            maxApps: tierConfig.maxApps,
            renewAt: new Date(subscription.current_period_end * 1000),
          },
        });

        await db.transaction.create({
          data: {
            userId: metadata.userId,
            type: 'subscription',
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency?.toUpperCase() || 'USD',
            method: 'stripe',
            status: 'completed',
            stripePaymentId: session.payment_intent as string,
          },
        });
      }
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
      
      await db.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          renewAt: new Date(subscription.current_period_end * 1000),
        },
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      
      await db.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: 'cancelled',
        },
      });
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
};

export const cancelSubscription = async (subscriptionId: string) => {
  await stripe.subscriptions.cancel(subscriptionId);
  
  await db.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: 'cancelled' },
  });
};

export { stripe };

/**
 * Stripe Payment Service
 * Handles subscription payments and credit purchases
 */

import Stripe from 'stripe';
import { SubscriptionService } from '../subscription';
import { adminService } from '../admin';
import { getDb } from '../../lib/db';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not configured, Stripe payments will not work');
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    })
  : null;

export class StripeService {
  private subscriptionService = new SubscriptionService();

  /**
   * Create Stripe checkout session for subscription
   */
  async createSubscriptionCheckout(
    userId: number,
    tier: string,
    userEmail?: string
  ): Promise<{ sessionId: string; url: string }> {
    if (!stripe) {
      throw new Error('Stripe not configured');
    }

    const tiers = SubscriptionService.getAvailableTiers();
    const tierInfo = tiers.find((t) => t.name.toLowerCase() === tier.toLowerCase());

    if (!tierInfo) {
      throw new Error('Invalid tier');
    }

    // Price IDs would be configured in Stripe Dashboard
    const priceIds: Record<string, string> = {
      starter: process.env.STRIPE_PRICE_STARTER || 'price_starter_id',
      growth: process.env.STRIPE_PRICE_GROWTH || 'price_growth_id',
      pro: process.env.STRIPE_PRICE_PRO || 'price_pro_id',
      enterprise: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_id'
    };

    const priceId = priceIds[tier.toLowerCase()];

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.BASE_URL || 'https://goldmine.zo.space'}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL || 'https://goldmine.zo.space'}/subscription?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId: userId.toString(),
        tier: tier.toLowerCase()
      }
    });

    return {
      sessionId: session.id,
      url: session.url!
    };
  }

  /**
   * Create checkout session for credit purchase
   */
  async createCreditCheckout(
    userId: number,
    credits: number,
    userEmail?: string
  ): Promise<{ sessionId: string; url: string }> {
    if (!stripe) {
      throw new Error('Stripe not configured');
    }

    // Credit pricing
    const creditPackages = [
      { credits: 500, price: 4.99 },
      { credits: 1000, price: 8.99 },
      { credits: 2500, price: 19.99 },
      { credits: 5000, price: 34.99 },
      { credits: 10000, price: 59.99 }
    ];

    const pkg = creditPackages.find((p) => p.credits === credits);
    if (!pkg) {
      throw new Error('Invalid credit package');
    }

    const priceInCents = Math.round(pkg.price * 100);

    // Create a one-time price
    const price = await stripe.prices.create({
      unit_amount: priceInCents,
      currency: 'usd',
      product_data: {
        name: `${credits} Credits`,
        description: `Purchase ${credits} credits for app generation`
      }
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      success_url: `${process.env.BASE_URL || 'https://goldmine.zo.space'}/subscription?credits_purchase=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL || 'https://goldmine.zo.space'}/subscription?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId: userId.toString(),
        credits: credits.toString()
      }
    });

    return {
      sessionId: session.id,
      url: session.url!
    };
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(
    signature: string,
    payload: string
  ): Promise<void> {
    if (!stripe) {
      throw new Error('Stripe not configured');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error: any) {
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutCompleted(session);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionUpdated(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionDeleted(subscription);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await this.handleInvoicePaymentSucceeded(invoice);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const userId = parseInt(session.metadata?.userId || '0');
    const credits = parseInt(session.metadata?.credits || '0');
    const tier = session.metadata?.tier;

    if (credits > 0) {
      // Credit purchase
      await this.subscriptionService.addCredits(
        userId,
        credits,
        'purchase',
        `Credit purchase via Stripe (Session: ${session.id})`
      );

      // Record payment
      await this.recordPayment(userId, session.amount_total! / 100, 'stripe', session.id, credits);
    } else if (tier) {
      // Subscription
      await this.subscriptionService.changeSubscription(
        userId,
        tier,
        session.subscription as string,
        session.customer as string
      );
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    // Get user ID from subscription metadata
    const userId = parseInt(subscription.metadata?.userId || '0');
    if (!userId) return;

    // Determine tier from price
    const priceId = subscription.items.data[0]?.price.id;
    const tier = this.getTierFromPrice(priceId);

    if (tier) {
      await this.subscriptionService.changeSubscription(
        userId,
        tier,
        subscription.id,
        subscription.customer as string
      );
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const userId = parseInt(subscription.metadata?.userId || '0');
    if (!userId) return;

    await this.subscriptionService.cancelSubscription(userId);
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = invoice.subscription as string;
    const subscription = await stripe?.subscriptions.retrieve(subscriptionId);

    if (subscription) {
      const userId = parseInt(subscription.metadata?.userId || '0');
      const tier = this.getTierFromPrice(subscription.items.data[0]?.price.id || '');

      if (userId && tier) {
        // Add monthly credits
        await this.subscriptionService.addCredits(
          userId,
          SubscriptionService.getTierDetails(tier)!.creditsPerMonth,
          'subscription',
          `Monthly credits for ${tier} plan`
        );
      }
    }
  }

  private getTierFromPrice(priceId: string): string | null {
    const priceMapping: Record<string, string> = {
      [process.env.STRIPE_PRICE_STARTER || '']: 'starter',
      [process.env.STRIPE_PRICE_GROWTH || '']: 'growth',
      [process.env.STRIPE_PRICE_PRO || '']: 'pro',
      [process.env.STRIPE_PRICE_ENTERPRISE || '']: 'enterprise'
    };

    return priceMapping[priceId] || null;
  }

  private async recordPayment(
    userId: number,
    amount: number,
    method: string,
    stripePaymentId: string,
    creditsPurchased?: number
  ): Promise<void> {
    const db = getDb();

    // Record payment and platform earnings
    const stmt = db.prepare(`
      INSERT INTO payments (user_id, amount, currency, method, status, stripe_payment_intent_id, credits_purchased)
      VALUES (?, ?, 'USD', ?, 'completed', ?, ?)
    `);

    stmt.run(userId, amount, method, stripePaymentId, creditsPurchased || null);

    // Record platform revenue share (40% of payment goes to platform)
    if (amount > 0) {
      adminService.recordPlatformEarnings(
        parseInt(stripePaymentId),
        amount,
        `Stripe payment - Platform revenue share (40%)`
      );
    }
  }
}

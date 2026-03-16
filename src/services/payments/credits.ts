/**
 * Credit Service - Manage credit purchases and usage
 */

import { SubscriptionService } from '../subscription';
import { StripeService } from './stripe';
import { CryptoPaymentService } from './crypto';
import { FramesPaymentService } from './frames';

export class CreditService {
  private subscriptionService = new SubscriptionService();
  private stripeService = new StripeService();
  private cryptoService = new CryptoPaymentService();
  private framesService = new FramesPaymentService();

  /**
   * Purchase credits with different methods
   */
  async purchaseCredits(
    userId: number,
    credits: number,
    method: 'stripe' | 'crypto' | 'frame',
    options?: {
      currency?: 'eth' | 'usdc';
      userEmail?: string;
    }
  ): Promise<{
    success: boolean;
    checkoutUrl?: string;
    paymentAddress?: string;
    amount?: string;
    frameUrl?: string;
    error?: string;
  }> {
    try {
      switch (method) {
        case 'stripe': {
          if (!options?.userEmail) {
            return { success: false, error: 'Email required for Stripe' };
          }

          const checkout = await this.stripeService.createCreditCheckout(userId, credits, options.userEmail);
          return { success: true, checkoutUrl: checkout.url };
        }

        case 'crypto': {
          const payment = await this.cryptoService.generatePaymentAddress(
            userId,
            options?.currency || 'usdc',
            credits
          );
          return { success: true, paymentAddress: payment.address, amount: payment.amount };
        }

        case 'frame': {
          const frame = await this.framesService.generatePaymentFrame(
            userId,
            credits,
            options?.currency || 'usdc'
          );
          return { success: true, frameUrl: frame.frameUrl };
        }

        default:
          return { success: false, error: 'Invalid payment method' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify crypto or frame payment
   */
  async verifyPayment(
    userId: number,
    txHash: string,
    method: 'crypto' | 'frame'
  ): Promise<{ success: boolean; creditsAdded?: number }> {
    try {
      switch (method) {
        case 'crypto':
          return await this.cryptoService.verifyPayment(userId, txHash);
        case 'frame':
          // Extract paymentId from somewhere or pass it directly
          return { success: false };
        default:
          return { success: false };
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      return { success: false };
    }
  }

  /**
   * Get available credit packages
   */
  getCreditPackages(): Array<{ credits: number; stripePrice: number; cryptoUsdc: number; cryptoEth: number }> {
    return [
      { credits: 500, stripePrice: 4.99, cryptoUsdc: 5.0, cryptoEth: 0.002 },
      { credits: 1000, stripePrice: 8.99, cryptoUsdc: 9.0, cryptoEth: 0.0035 },
      { credits: 2500, stripePrice: 19.99, cryptoUsdc: 20.0, cryptoEth: 0.008 },
      { credits: 5000, stripePrice: 34.99, cryptoUsdc: 35.0, cryptoEth: 0.014 },
      { credits: 10000, stripePrice: 59.99, cryptoUsdc: 60.0, cryptoEth: 0.024 }
    ];
  }

  /**
   * Get user's credit balance
   */
  async getBalance(userId: number) {
    return await this.subscriptionService.getCreditBalance(userId);
  }

  /**
   * Get credit transaction history
   */
  async getTransactionHistory(userId: number, limit: number = 50): Promise<Array<{
    id: number;
    amount: number;
    type: string;
    description: string;
    createdAt: string;
  }>> {
    const db = getDb();

    const stmt = db.prepare(`
      SELECT id, amount, type, description, created_at
      FROM credit_transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(userId, limit) as any[];

    return rows.map((row) => ({
      id: row.id,
      amount: row.amount,
      type: row.type,
      description: row.description,
      createdAt: row.created_at
    }));
  }
}

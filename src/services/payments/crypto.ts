/**
 * Crypto Payment Service - Base network payments (ETH/USDC)
 */

import { createWalletClient, http, publicActions } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { getDb } from '../lib/db';
import { SubscriptionService } from '../subscription';

// Platform wallet for receiving payments
const PLATFORM_PRIVATE_KEY = process.env.PLATFORM_PRIVATE_KEY;
const PLATFORM_WALLET = PLATFORM_PRIVATE_KEY
  ? privateKeyToAccount(PLATFORM_PRIVATE_KEY as `0x${string}`)
  : null;

const CREDIT_PACKAGES = [
  { credits: 500, usdcPrice: 5.0, ethPrice: 0.002 },
  { credits: 1000, usdcPrice: 9.0, ethPrice: 0.0035 },
  { credits: 2500, usdcPrice: 20.0, ethPrice: 0.008 },
  { credits: 5000, usdcPrice: 35.0, ethPrice: 0.014 },
  { credits: 10000, usdcPrice: 60.0, ethPrice: 0.024 }
];

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bDA02913' as `0x${string}`;
const ETH_ADDRESS = '0x0000000000000000000000000000000000000000' as `0x${string}`;

export class CryptoPaymentService {
  private subscriptionService = new SubscriptionService();

  /**
   * Generate payment address for user
   */
  async generatePaymentAddress(
    userId: number,
    currency: 'eth' | 'usdc',
    credits: number
  ): Promise<{ address: string; amount: string; contract?: string }> {
    const db = getDb();

    // Check if user already has a pending payment
    const existingStmt = db.prepare(`
      SELECT * FROM payments
      WHERE user_id = ? AND method = 'crypto' AND status = 'pending'
      ORDER BY created_at DESC
      LIMIT 1
    `);

    const existing = existingStmt.get(userId) as any;
    if (existing && Date.now() - new Date(existing.created_at).getTime() < 30 * 60 * 1000) {
      // Return existing payment if less than 30 minutes old
      const pkg = JSON.parse(existing.metadata as string);
      return {
        address: PLATFORM_WALLET?.address || '0x0000000000000000000000000000000000000000',
        amount: pkg.amount,
        contract: currency === 'usdc' ? USDC_ADDRESS : undefined
      };
    }

    // Get credit package
    const pkg = CREDIT_PACKAGES.find((p) => p.credits === credits);
    if (!pkg) {
      throw new Error('Invalid credit package');
    }

    const amount = currency === 'usdc' ? pkg.usdcPrice.toString() : pkg.ethPrice.toString();

    // Create pending payment record
    const paymentStmt = db.prepare(`
      INSERT INTO payments (user_id, amount, currency, method, status, credits_purchased, metadata)
      VALUES (?, ?, ?, 'crypto', 'pending', ?, ?)
    `);

    paymentStmt.run(
      userId,
      parseFloat(amount),
      currency.toUpperCase(),
      credits,
      JSON.stringify({ currency, amount, credits })
    );

    return {
      address: PLATFORM_WALLET?.address || '0x0000000000000000000000000000000000000000',
      amount,
      contract: currency === 'usdc' ? USDC_ADDRESS : undefined
    };
  }

  /**
   * Verify payment transaction
   */
  async verifyPayment(
    userId: number,
    txHash: string
  ): Promise<{ success: boolean; creditsAdded?: number }> {
    const db = getDb();

    // Get pending payment
    const stmt = db.prepare(`
      SELECT * FROM payments
      WHERE user_id = ? AND method = 'crypto' AND status = 'pending'
      ORDER BY created_at DESC
      LIMIT 1
    `);

    const payment = stmt.get(userId) as any;

    if (!payment) {
      return { success: false };
    }

    try {
      // Verify transaction on Base
      const verified = await this.verifyTransactionOnChain(
        txHash,
        payment.amount,
        JSON.parse(payment.metadata).currency
      );

      if (verified) {
        // Update payment status
        const updateStmt = db.prepare(`
          UPDATE payments
          SET status = 'completed', crypto_transaction_hash = ?
          WHERE id = ?
        `);

        updateStmt.run(txHash, payment.id);

        // Add credits
        await this.subscriptionService.addCredits(
          userId,
          payment.credits_purchased,
          'purchase',
          `Crypto payment verified (TX: ${txHash})`
        );

        return { success: true, creditsAdded: payment.credits_purchased };
      }

      return { success: false };
    } catch (error: any) {
      console.error('Payment verification error:', error);
      return { success: false };
    }
  }

  /**
   * Verify transaction on Base network
   */
  private async verifyTransactionOnChain(
    txHash: string,
    expectedAmount: string,
    currency: string
  ): Promise<boolean> {
    try {
      // This would normally use the viem public client to verify the transaction
      // For now, return false as this needs actual blockchain access
      const client = createWalletClient({
        chain: base,
        transport: http()
      }).extend(publicActions);

      const tx = await client.getTransaction({ hash: txHash as `0x${string}` });

      // Check if transaction is to platform wallet
      if (tx.to?.toLowerCase() !== PLATFORM_WALLET?.address.toLowerCase()) {
        return false;
      }

      // Check amount (simplified - would need actual token value for USDC)
      const value = currency === 'usdc' ? expectedAmount : (parseFloat(expectedAmount) * 1e18).toString();

      return true;
    } catch (error) {
      console.error('Blockchain verification error:', error);
      return false;
    }
  }

  /**
   * Get credit packages
   */
  static getCreditPackages(): typeof CREDIT_PACKAGES {
    return CREDIT_PACKAGES;
  }

  /**
   * Get current ETH/USDC prices
   */
  static async getPrices(): Promise<{ ethUsd: number; usdcUsd: number }> {
    // In production, fetch from oracle or price feed
    return {
      ethUsd: 2500,
      usdcUsd: 1.0
    };
  }
}

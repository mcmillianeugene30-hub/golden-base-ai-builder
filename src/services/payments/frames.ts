/**
 * Farcaster Frames Payment Service
 * One-tap payments through Farcaster Frames
 */

import { getDb } from '../../lib/db';
import { SubscriptionService } from '../subscription';
import { adminService } from '../admin';

export class FramesPaymentService {
  private subscriptionService = new SubscriptionService();

  /**
   * Generate a payment frame
   */
  async generatePaymentFrame(
    userId: number,
    credits: number,
    currency: 'eth' | 'usdc' = 'usdc'
  ): Promise<{
    frameUrl: string;
    frameData: any;
  }> {
    const db = getDb();

    // Get credit package
    const packages = [
      { credits: 500, usdcPrice: 5.0, ethPrice: 0.002 },
      { credits: 1000, usdcPrice: 9.0, ethPrice: 0.0035 },
      { credits: 2500, usdcPrice: 20.0, ethPrice: 0.008 },
      { credits: 5000, usdcPrice: 35.0, ethPrice: 0.014 },
      { credits: 10000, usdcPrice: 60.0, ethPrice: 0.024 }
    ];

    const pkg = packages.find((p) => p.credits === credits);
    if (!pkg) {
      throw new Error('Invalid credit package');
    }

    const amount = currency === 'usdc' ? pkg.usdcPrice : pkg.ethPrice;
    const platformAddress = adminService.getPlatformWalletAddress();

    // Create pending payment
    const stmt = db.prepare(`
      INSERT INTO payments (user_id, amount, currency, method, status, credits_purchased, metadata)
      VALUES (?, ?, ?, 'frame', 'pending', ?, ?)
    `);

    const result = stmt.run(
      userId,
      amount,
      currency.toUpperCase(),
      credits,
      JSON.stringify({ currency, credits, pkg })
    );

    const paymentId = result.lastInsertRowid as number;

    // Generate frame data
    const frameData = {
      version: 'vNext',
      image: `${process.env.BASE_URL || 'https://goldmine.zo.space'}/api/frame/image/${paymentId}`,
      postUrl: `${process.env.BASE_URL || 'https://goldmine.zo.space'}/api/frame/payment/${paymentId}`,
      buttons: [
        {
          label: `Buy ${credits} Credits for $${amount}`,
          action: 'tx',
          target: {
            to: platformAddress,
            value: currency === 'eth' ? `0x${Math.floor(amount * 1e18).toString(16)}` : '0x0',
            abi: currency === 'usdc' ? this.getUSDCTransferABI(platformAddress, amount) : undefined
          }
        },
        {
          label: 'Cancel',
          action: 'link',
          target: `${process.env.BASE_URL || 'https://goldmine.zo.space'}/subscription`
        }
      ],
      state: {
        paymentId,
        userId,
        credits,
        currency
      }
    };

    return {
      frameUrl: `${process.env.BASE_URL || 'https://goldmine.zo.space'}/api/frame/manifest/${paymentId}`,
      frameData
    };
  }

  /**
   * Handle frame payment callback
   */
  async handleFramePayment(
    paymentId: number,
    txHash: string
  ): Promise<{ success: boolean; creditsAdded?: number }> {
    const db = getDb();

    // Get payment record
    const stmt = db.prepare(`
      SELECT * FROM payments
      WHERE id = ? AND method = 'frame' AND status = 'pending'
    `);

    const payment = stmt.get(paymentId) as any;

    if (!payment) {
      return { success: false };
    }

    try {
      // Verify transaction
      // In production, this would verify the transaction on Base
      // For now, we'll mark it as complete

      const updateStmt = db.prepare(`
        UPDATE payments
        SET status = 'completed', crypto_transaction_hash = ?
        WHERE id = ?
      `);

      updateStmt.run(txHash, paymentId);

      // Add credits
      await this.subscriptionService.addCredits(
        payment.user_id,
        payment.credits_purchased,
        'purchase',
        `Frame payment completed (TX: ${txHash})`
      );

      // Record platform revenue share (40% of payment goes to platform)
      adminService.recordPlatformEarnings(
        payment.id,
        payment.amount,
        `Frame payment - Platform revenue share (40%)`
      );

      return { success: true, creditsAdded: payment.credits_purchased };
    } catch (error: any) {
      console.error('Frame payment error:', error);
      return { success: false };
    }
  }

  /**
   * Generate frame image
   */
  generateFrameImage(paymentId: number): string {
    // In production, generate an SVG or use an image service
    return `
    <svg width="800" height="418" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="418" fill="#1a1a2e"/>
      <text x="400" y="180" font-family="Arial" font-size="32" fill="white" text-anchor="middle">
        Golden Base AI Builder
      </text>
      <text x="400" y="230" font-family="Arial" font-size="24" fill="#a855f7" text-anchor="middle">
        Purchase Credits
      </text>
      <text x="400" y="280" font-family="Arial" font-size="18" fill="#888" text-anchor="middle">
        Payment ID: ${paymentId}
      </text>
      <text x="400" y="320" font-family="Arial" font-size="16" fill="#666" text-anchor="middle">
        Powered by Farcaster Frames
      </text>
    </svg>
    `;
  }

  /**
   * Get USDC transfer ABI
   */
  private getUSDCTransferABI(to: string, amount: number): any[] {
    return [
      {
        type: 'function',
        name: 'transfer',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'amount', type: 'uint256' }
        ]
      }
    ];
  }
}

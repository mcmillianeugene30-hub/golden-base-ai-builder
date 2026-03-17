import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { verifyPayment, recordCryptoPayment, getCryptoPaymentQRCode } from '@/lib/crypto';
import { ADMIN_CONFIG, CREDIT_PACKS, SUBSCRIPTION_TIERS } from '@/packages/config/admin';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { txHash, amount, currency, type, tier, pack } = body;

    if (!txHash || !amount || !currency || !type) {
      return NextResponse.json(
        { error: 'Transaction hash, amount, currency, and type are required' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isAdmin = user.fid === ADMIN_CONFIG.fid || user.username === ADMIN_CONFIG.username;

    if (isAdmin) {
      if (type === 'subscription' && tier) {
        const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
        await db.subscription.upsert({
          where: { userId: session.user.id },
          create: {
            userId: session.user.id,
            tier,
            status: 'active',
            credits: tierConfig.credits,
            maxApps: tierConfig.maxApps,
          },
          update: {
            tier,
            status: 'active',
            credits: tierConfig.credits,
            maxApps: tierConfig.maxApps,
          },
        });
      } else if (type === 'credits' && pack) {
        const packConfig = CREDIT_PACKS[pack as keyof typeof CREDIT_PACKS];
        await db.user.update({
          where: { id: session.user.id },
          data: { credits: { increment: packConfig.credits } },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Admin: Payment recorded automatically',
      });
    }

    const transaction = await recordCryptoPayment(
      session.user.id,
      txHash,
      amount,
      currency,
      type
    );

    if (type === 'subscription' && tier) {
      const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
      await db.subscription.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          tier,
          status: 'active',
          credits: tierConfig.credits,
          maxApps: tierConfig.maxApps,
        },
        update: {
          tier,
          status: 'active',
          credits: tierConfig.credits,
          maxApps: tierConfig.maxApps,
        },
      });
    } else if (type === 'credits' && pack) {
      const packConfig = CREDIT_PACKS[pack as keyof typeof CREDIT_PACKS];
      await db.user.update({
        where: { id: session.user.id },
        data: { credits: { increment: packConfig.credits } },
      });
    }

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error: any) {
    console.error('Crypto payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process crypto payment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const amount = parseFloat(searchParams.get('amount') || '0');
    const currency = (searchParams.get('currency') || 'USDC') as 'USDC' | 'ETH';

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const qrCode = getCryptoPaymentQRCode(amount, currency);
    const address = ADMIN_CONFIG.wallet;

    return NextResponse.json({
      success: true,
      address,
      amount,
      currency,
      qrCode,
    });
  } catch (error: any) {
    console.error('Error generating crypto payment info:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate payment info' },
      { status: 500 }
    );
  }
}

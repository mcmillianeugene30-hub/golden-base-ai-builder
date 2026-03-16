import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { createCreditPackCheckoutSession } from '@/lib/stripe';
import { CREDIT_PACKS } from '@/packages/config/admin';

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
    const { pack } = body;

    if (!pack || !CREDIT_PACKS[pack as keyof typeof CREDIT_PACKS]) {
      return NextResponse.json(
        { error: 'Invalid credit pack' },
        { status: 400 }
      );
    }

    const checkoutSession = await createCreditPackCheckoutSession(session.user.id, pack);

    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error: any) {
    console.error('Credit purchase error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create credit pack session' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { ADMIN_CONFIG, PLATFORM_REVENUE_SHARE } from '@/packages/config/admin';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    const isAdmin = user?.fid === ADMIN_CONFIG.fid || user?.username === ADMIN_CONFIG.username;

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : new Date();

    const [totalRevenue, subscriptionRevenue, creditPackRevenue, transactionCount] = await Promise.all([
      db.transaction.aggregate({
        where: {
          status: 'completed',
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: {
          type: 'subscription',
          status: 'completed',
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
        _count: true,
      }),
      db.transaction.aggregate({
        where: {
          type: 'credits_purchased',
          status: 'completed',
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
        _count: true,
      }),
      db.transaction.count({
        where: {
          status: 'completed',
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    const connectorRevenueData = await db.connectorRevenue.findMany({
      orderBy: { totalRevenue: 'desc' },
    });

    const platformRevenue = (totalRevenue._sum.amount || 0) * PLATFORM_REVENUE_SHARE;
    const connectorRevenue = connectorRevenueData.reduce(
      (sum, cr) => sum + parseFloat(cr.developerShare.toString()),
      0
    );

    return NextResponse.json({
      success: true,
      revenue: {
        total: totalRevenue._sum.amount || 0,
        subscriptions: subscriptionRevenue._sum.amount || 0,
        subscriptionCount: subscriptionRevenue._count || 0,
        creditPacks: creditPackRevenue._sum.amount || 0,
        creditPackCount: creditPackRevenue._count || 0,
        platformShare: platformRevenue,
        connectorShare: connectorRevenue,
        transactionCount,
      },
      connectorRevenue: connectorRevenueData,
    });
  } catch (error: any) {
    console.error('Error fetching revenue:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch revenue' },
      { status: 500 }
    );
  }
}

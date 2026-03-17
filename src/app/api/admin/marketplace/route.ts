import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { ADMIN_CONFIG } from '@/packages/config/admin';

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { itemId, status } = body;

    if (!itemId || !status) {
      return NextResponse.json(
        { error: 'Item ID and status are required' },
        { status: 400 }
      );
    }

    const item = await db.marketplaceItem.update({
      where: { id: itemId },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      item,
    });
  } catch (error: any) {
    console.error('Error updating marketplace item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update marketplace item' },
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
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const items = await db.marketplaceItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error: any) {
    console.error('Error fetching marketplace items:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch marketplace items' },
      { status: 500 }
    );
  }
}

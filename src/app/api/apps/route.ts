import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { ADMIN_CONFIG } from '@/packages/config/admin';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const apps = await db.app.findMany({
      where: { userId: session.user.id },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        deployments: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      apps,
    });
  } catch (error: any) {
    console.error('Error fetching apps:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch apps' },
      { status: 500 }
    );
  }
}

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
    const { name, description, code } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: 'Name and code are required' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isAdmin = user.fid === ADMIN_CONFIG.fid || user.username === ADMIN_CONFIG.username;

    if (!isAdmin && user.subscription) {
      const appCount = await db.app.count({ where: { userId: session.user.id } });
      if (appCount >= user.subscription.maxApps) {
        return NextResponse.json(
          {
            error: 'App limit reached',
            message: 'Upgrade your subscription to create more apps',
          },
          { status: 403 }
        );
      }
    }

    const app = await db.app.create({
      data: {
        userId: session.user.id,
        name,
        description,
        code,
      },
    });

    await db.version.create({
      data: {
        appId: app.id,
        code,
        comment: 'Initial version',
      },
    });

    return NextResponse.json({
      success: true,
      app,
    });
  } catch (error: any) {
    console.error('Error creating app:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create app' },
      { status: 500 }
    );
  }
}

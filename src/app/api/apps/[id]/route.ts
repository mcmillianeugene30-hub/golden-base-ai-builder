import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const app = await db.app.findUnique({
      where: { id: params.id },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
        },
        deployments: true,
      },
    });

    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    if (app.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      app,
    });
  } catch (error: any) {
    console.error('Error fetching app:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch app' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const app = await db.app.findUnique({
      where: { id: params.id },
    });

    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    if (app.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const updatedApp = await db.app.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(code && { code }),
      },
    });

    if (code) {
      await db.version.create({
        data: {
          appId: app.id,
          code,
          comment: body.comment || 'Updated code',
        },
      });
    }

    return NextResponse.json({
      success: true,
      app: updatedApp,
    });
  } catch (error: any) {
    console.error('Error updating app:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update app' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const app = await db.app.findUnique({
      where: { id: params.id },
    });

    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    if (app.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await db.app.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'App deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting app:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete app' },
      { status: 500 }
    );
  }
}

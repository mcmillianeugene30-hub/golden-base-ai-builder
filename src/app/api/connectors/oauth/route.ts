import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { ADMIN_CONFIG, CREDIT_COSTS } from '@/packages/config/admin';

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
    const { connector, code, state } = body;

    if (!connector || !code) {
      return NextResponse.json(
        { error: 'Connector and code are required' },
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

    if (!isAdmin && !user.subscription) {
      return NextResponse.json(
        {
          error: 'No subscription',
          message: 'Subscribe to use connectors',
        },
        { status: 403 }
      );
    }

    let accessToken: string;
    let refreshToken: string | undefined;
    let expiresAt: Date | undefined;

    switch (connector) {
      case 'github':
        const githubResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
          }),
        });
        const githubData = await githubResponse.json();
        accessToken = githubData.access_token;
        break;

      case 'vercel':
        const vercelResponse = await fetch('https://api.vercel.com/v2/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: process.env.VERCEL_CLIENT_ID,
            client_secret: process.env.VERCEL_CLIENT_SECRET,
            code,
            redirect_uri: `${process.env.NEXTAUTH_URL}/dashboard/connectors/callback/${connector}`,
          }),
        });
        const vercelData = await vercelResponse.json();
        accessToken = vercelData.access_token;
        refreshToken = vercelData.refresh_token;
        expiresAt = vercelData.expires_at ? new Date(vercelData.expires_at * 1000) : undefined;
        break;

      case 'notion':
        const notionResponse = await fetch('https://api.notion.com/v1/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: process.env.NOTION_CLIENT_ID,
            client_secret: process.env.NOTION_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
          }),
        });
        const notionData = await notionResponse.json();
        accessToken = notionData.access_token;
        break;

      default:
        return NextResponse.json(
          { error: 'Unsupported connector' },
          { status: 400 }
        );
    }

    const connectorAuth = await db.connectorAuth.upsert({
      where: {
        userId_connector: {
          userId: session.user.id,
          connector,
        },
      },
      create: {
        userId: session.user.id,
        connector,
        accessToken,
        refreshToken,
        expiresAt,
      },
      update: {
        accessToken,
        refreshToken,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      connector: connectorAuth.connector,
      connectedAt: connectorAuth.createdAt,
    });
  } catch (error: any) {
    console.error('OAuth error:', error);
    return NextResponse.json(
      { error: error.message || 'OAuth authentication failed' },
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

    const connectorAuths = await db.connectorAuth.findMany({
      where: { userId: session.user.id },
    });

    const connectedConnectors = connectorAuths.map((auth) => auth.connector);

    return NextResponse.json({
      success: true,
      connectedConnectors,
    });
  } catch (error: any) {
    console.error('Error fetching connectors:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch connectors' },
      { status: 500 }
    );
  }
}

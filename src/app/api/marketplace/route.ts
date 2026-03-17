import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = { status: 'approved' };

    if (type && type !== 'all') {
      where.type = type;
    }

    const items = await db.marketplaceItem.findMany({
      where,
      orderBy: { installs: 'desc' },
    });

    let filteredItems = items;

    if (category && category !== 'all') {
      filteredItems = filteredItems.filter((item: any) =>
        item.manifest?.category === category
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredItems = filteredItems.filter((item: any) =>
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      items: filteredItems,
    });
  } catch (error: any) {
    console.error('Error fetching marketplace items:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch marketplace items' },
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
    const { type, name, description, price, manifest } = body;

    if (!type || !name || !description) {
      return NextResponse.json(
        { error: 'Type, name, and description are required' },
        { status: 400 }
      );
    }

    const item = await db.marketplaceItem.create({
      data: {
        type,
        name,
        description,
        developerId: session.user.id,
        price: price || 0,
        manifest,
        status: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      item,
      message: 'Your submission is pending approval',
    });
  } catch (error: any) {
    console.error('Error creating marketplace item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create marketplace item' },
      { status: 500 }
    );
  }
}

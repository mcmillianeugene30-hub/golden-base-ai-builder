import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { aiService } from '@/lib/ai';
import { db } from '@/lib/db';
import { ADMIN_CONFIG } from '@/packages/config/admin';

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
    const { prompt, provider, model, type = 'app' } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
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
          error: 'No active subscription',
          message: 'Please subscribe to access AI features',
        },
        { status: 403 }
      );
    }

    if (!isAdmin && user.credits < 50) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          message: 'Please purchase credits to continue',
        },
        { status: 402 }
      );
    }

    const result = await aiService.generate(session.user.id, prompt, {
      provider,
      model,
      type,
    });

    return NextResponse.json({
      success: true,
      content: result.content,
      creditsUsed: result.creditsUsed,
      provider: result.provider,
      remainingCredits: isAdmin ? 'Unlimited' : (user.credits - result.creditsUsed),
    });
  } catch (error: any) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate content',
        success: false,
      },
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

    const providers = aiService.getAvailableProviders();
    const models: Record<string, string[]> = {};
    
    providers.forEach(provider => {
      models[provider] = aiService.getProviderModels(provider);
    });

    return NextResponse.json({
      success: true,
      providers,
      models,
    });
  } catch (error: any) {
    console.error('Error fetching AI info:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch AI info' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Interaction 목록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postmanId = searchParams.get('postmanId');
    const userId = searchParams.get('userId') || 'test-user-id';

    if (postmanId) {
      // 특정 포스트맨의 상호작용
      const interactions = await prisma.interaction.findMany({
        where: { postmanId },
        orderBy: { date: 'desc' },
        take: 50
      });

      return NextResponse.json({
        success: true,
        data: interactions
      });
    }

    // 전체 상호작용 (최근 100개)
    const interactions = await prisma.interaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 100,
      include: {
        postman: {
          select: {
            name: true,
            company: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: interactions
    });
  } catch (error) {
    console.error('GET /api/interaction error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch interactions' },
      { status: 500 }
    );
  }
}

// POST: 새로운 Interaction 생성
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postmanId, type, category, description, date, userId } = body;

    if (!postmanId || !type || !category || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Interaction 생성
    const interaction = await prisma.interaction.create({
      data: {
        postmanId,
        userId: userId || 'test-user-id',
        type,
        category,
        description,
        date: date ? new Date(date) : new Date()
      }
    });

    // 포스트맨의 Give/Take 점수 업데이트
    const postman = await prisma.postman.findUnique({
      where: { id: postmanId }
    });

    if (postman) {
      await prisma.postman.update({
        where: { id: postmanId },
        data: {
          giveScore: type === 'GIVE' ? postman.giveScore + 1 : postman.giveScore,
          takeScore: type === 'TAKE' ? postman.takeScore + 1 : postman.takeScore,
          lastContact: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: interaction
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/interaction error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create interaction' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

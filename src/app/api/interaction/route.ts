import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/getUser';

export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postmanId = searchParams.get('postmanId');

    if (postmanId) {
      const interactions = await prisma.interaction.findMany({
        where: { postmanId, userId: user.id! },
        orderBy: { date: 'desc' },
        take: 50
      });

      return NextResponse.json({
        success: true,
        data: interactions
      });
    }

    const interactions = await prisma.interaction.findMany({
      where: { userId: user.id! },
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

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { postmanId, type, category, description, date } = body;

    if (!postmanId || !type || !category || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const interaction = await prisma.interaction.create({
      data: {
        postmanId,
        userId: user.id!,
        type,
        category,
        description,
        date: date ? new Date(date) : new Date()
      }
    });

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

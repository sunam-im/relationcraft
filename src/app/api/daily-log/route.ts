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
    const date = searchParams.get('date');

    if (date) {
      const log = await prisma.dailyLog.findUnique({
        where: {
          userId_date: {
            userId: user.id!,
            date: new Date(date)
          }
        }
      });

      return NextResponse.json({
        success: true,
        data: log
      });
    }

    const logs = await prisma.dailyLog.findMany({
      where: { userId: user.id! },
      orderBy: { date: 'desc' },
      take: 30
    });

    return NextResponse.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('GET /api/daily-log error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch daily logs' },
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
    const { date, content, goals, achievements } = body;

    if (!date || !content) {
      return NextResponse.json(
        { success: false, error: 'Date and content are required' },
        { status: 400 }
      );
    }

    const log = await prisma.dailyLog.upsert({
      where: {
        userId_date: {
          userId: user.id!,
          date: new Date(date)
        }
      },
      create: {
        userId: user.id!,
        date: new Date(date),
        content,
        goals,
        achievements
      },
      update: {
        content,
        goals,
        achievements
      }
    });

    return NextResponse.json({
      success: true,
      data: log
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/daily-log error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save daily log' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

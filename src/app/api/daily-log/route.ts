import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'test-user-id';
    const date = searchParams.get('date');

    if (date) {
      const log = await prisma.dailyLog.findUnique({
        where: {
          userId_date: {
            userId,
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
      where: { userId },
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
    const body = await request.json();
    const { date, content, goals, achievements, userId } = body;

    if (!date || !content) {
      return NextResponse.json(
        { success: false, error: 'Date and content are required' },
        { status: 400 }
      );
    }

    const log = await prisma.dailyLog.upsert({
      where: {
        userId_date: {
          userId: userId || 'test-user-id',
          date: new Date(date)
        }
      },
      create: {
        userId: userId || 'test-user-id',
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

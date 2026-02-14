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
    const { date, content, goals, achievements, bookTitle, letterCount, callCount, snsCount, giftCount, insight, productiveWork, infoToConvey, infoRecipient, successReason, myStrengths, habitsToDiscard, todayAchievement, achievementSource, gratitude } = body;

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
        achievements,
        bookTitle: bookTitle || null,
        letterCount: letterCount ? parseInt(letterCount) : 0,
        callCount: callCount ? parseInt(callCount) : 0,
        snsCount: snsCount ? parseInt(snsCount) : 0,
        giftCount: giftCount ? parseInt(giftCount) : 0,
        insight: insight || null,
        productiveWork: productiveWork || null,
        infoToConvey: infoToConvey || null,
        infoRecipient: infoRecipient || null,
        successReason: successReason || null,
        myStrengths: myStrengths || null,
        habitsToDiscard: habitsToDiscard || null,
        todayAchievement: todayAchievement || null,
        achievementSource: achievementSource || null,
        gratitude: gratitude || null
      },
      update: {
        content,
        goals,
        achievements,
        bookTitle: bookTitle || null,
        letterCount: letterCount ? parseInt(letterCount) : 0,
        callCount: callCount ? parseInt(callCount) : 0,
        snsCount: snsCount ? parseInt(snsCount) : 0,
        giftCount: giftCount ? parseInt(giftCount) : 0,
        insight: insight || null,
        productiveWork: productiveWork || null,
        infoToConvey: infoToConvey || null,
        infoRecipient: infoRecipient || null,
        successReason: successReason || null,
        myStrengths: myStrengths || null,
        habitsToDiscard: habitsToDiscard || null,
        todayAchievement: todayAchievement || null,
        achievementSource: achievementSource || null,
        gratitude: gratitude || null
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

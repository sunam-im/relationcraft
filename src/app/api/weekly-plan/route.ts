import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/getUser';

function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get('weekStart') || getWeekStart();

    const plan = await prisma.weeklyPlan.findUnique({
      where: {
        userId_weekStart: {
          userId: user.id!,
          weekStart: new Date(weekStart)
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('GET /api/weekly-plan error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch weekly plan' },
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
    const { weekStart, plan1, plan2, plan3, status1, status2, status3 } = body;

    if (!weekStart) {
      return NextResponse.json(
        { success: false, error: 'weekStart is required' },
        { status: 400 }
      );
    }

    const plan = await prisma.weeklyPlan.upsert({
      where: {
        userId_weekStart: {
          userId: user.id!,
          weekStart: new Date(weekStart)
        }
      },
      create: {
        userId: user.id!,
        weekStart: new Date(weekStart),
        plan1,
        plan2,
        plan3,
        status1: status1 || 'TODO',
        status2: status2 || 'TODO',
        status3: status3 || 'TODO'
      },
      update: {
        plan1,
        plan2,
        plan3,
        status1,
        status2,
        status3
      }
    });

    return NextResponse.json({
      success: true,
      data: plan
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/weekly-plan error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save weekly plan' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

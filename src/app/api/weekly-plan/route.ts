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
    const { weekStart, plan1, plan2, plan3, status1, status2, status3,
      name1, phone1, purpose1, location1, meetDate1, meetTime1, myBusiness1, theirBusiness1, theirInterest1, isPlus1, mealCheck1,
      name2, phone2, purpose2, location2, meetDate2, meetTime2, myBusiness2, theirBusiness2, theirInterest2, isPlus2, mealCheck2,
      name3, phone3, purpose3, location3, meetDate3, meetTime3, myBusiness3, theirBusiness3, theirInterest3, isPlus3, mealCheck3,
      meetingNote1, nextAction1, meetingNote2, nextAction2, meetingNote3, nextAction3
    } = body;

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
        status3: status3 || 'TODO',

        name1: name1 || null, phone1: phone1 || null, purpose1: purpose1 || null, location1: location1 || null,
        meetDate1: meetDate1 || null, meetTime1: meetTime1 || null, myBusiness1: myBusiness1 || null,
        theirBusiness1: theirBusiness1 || null, theirInterest1: theirInterest1 || null, isPlus1: isPlus1 || false, mealCheck1: mealCheck1 || null,
        name2: name2 || null, phone2: phone2 || null, purpose2: purpose2 || null, location2: location2 || null,
        meetDate2: meetDate2 || null, meetTime2: meetTime2 || null, myBusiness2: myBusiness2 || null,
        theirBusiness2: theirBusiness2 || null, theirInterest2: theirInterest2 || null, isPlus2: isPlus2 || false, mealCheck2: mealCheck2 || null,
        name3: name3 || null, phone3: phone3 || null, purpose3: purpose3 || null, location3: location3 || null,
        meetDate3: meetDate3 || null, meetTime3: meetTime3 || null, myBusiness3: myBusiness3 || null,
        theirBusiness3: theirBusiness3 || null, theirInterest3: theirInterest3 || null, isPlus3: isPlus3 || false, mealCheck3: mealCheck3 || null,
        meetingNote1: meetingNote1 || null, nextAction1: nextAction1 || null,
        meetingNote2: meetingNote2 || null, nextAction2: nextAction2 || null,
        meetingNote3: meetingNote3 || null, nextAction3: nextAction3 || null,
      },
      update: {
        plan1,
        plan2,
        plan3,
        status1,
        status2,
        status3,

        name1: name1 || null, phone1: phone1 || null, purpose1: purpose1 || null, location1: location1 || null,
        meetDate1: meetDate1 || null, meetTime1: meetTime1 || null, myBusiness1: myBusiness1 || null,
        theirBusiness1: theirBusiness1 || null, theirInterest1: theirInterest1 || null, isPlus1: isPlus1 || false, mealCheck1: mealCheck1 || null,
        name2: name2 || null, phone2: phone2 || null, purpose2: purpose2 || null, location2: location2 || null,
        meetDate2: meetDate2 || null, meetTime2: meetTime2 || null, myBusiness2: myBusiness2 || null,
        theirBusiness2: theirBusiness2 || null, theirInterest2: theirInterest2 || null, isPlus2: isPlus2 || false, mealCheck2: mealCheck2 || null,
        name3: name3 || null, phone3: phone3 || null, purpose3: purpose3 || null, location3: location3 || null,
        meetDate3: meetDate3 || null, meetTime3: meetTime3 || null, myBusiness3: myBusiness3 || null,
        theirBusiness3: theirBusiness3 || null, theirInterest3: theirInterest3 || null, isPlus3: isPlus3 || false, mealCheck3: mealCheck3 || null,
        meetingNote1: meetingNote1 || null, nextAction1: nextAction1 || null,
        meetingNote2: meetingNote2 || null, nextAction2: nextAction2 || null,
        meetingNote3: meetingNote3 || null, nextAction3: nextAction3 || null,
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

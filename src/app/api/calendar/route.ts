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
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (start) dateFilter.gte = new Date(start);
    if (end) dateFilter.lte = new Date(end);

    const interactions = await prisma.interaction.findMany({
      where: {
        userId: user.id!,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      },
      orderBy: { date: 'desc' },
      include: { postman: { select: { name: true, company: true } } },
    });

    const dailyLogs = await prisma.dailyLog.findMany({
      where: {
        userId: user.id!,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      },
      orderBy: { date: 'desc' },
    });

    const events = [
      ...interactions.map((item) => ({
        id: item.id,
        title: `[${item.type}] ${item.postman.name} - ${item.category}`,
        start: item.date, end: item.date,
        type: 'interaction' as const,
        subType: item.type, category: item.category,
        description: item.description,
        postmanName: item.postman.name, postmanCompany: item.postman.company,
      })),
      ...dailyLogs.map((log) => ({
        id: log.id,
        title: '📝 데일리 로그',
        start: log.date, end: log.date,
        type: 'dailyLog' as const,
        subType: null, category: null,
        description: log.content.substring(0, 100),
        postmanName: null, postmanCompany: null,
      })),
    ];

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error('GET /api/calendar error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendar data' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

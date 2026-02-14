import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/getUser';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const notices = await prisma.notice.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, title: true, content: true, createdAt: true },
    });

    return NextResponse.json({ success: true, data: notices });
  } catch (error) {
    console.error('Notices error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

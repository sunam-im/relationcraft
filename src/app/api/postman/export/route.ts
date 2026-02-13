import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'test-user-id';

    const postmen = await prisma.postman.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });

    // CSV 헤더
    const header = '이름,회사,직책,전화번호,이메일,구분,Give점수,Take점수,최근연락일,메모';

    // CSV 본문
    const rows = postmen.map((p) => {
      const fields = [
        p.name,
        p.company || '',
        p.position || '',
        p.phone || '',
        p.email || '',
        p.category,
        p.giveScore.toString(),
        p.takeScore.toString(),
        p.lastContact ? new Date(p.lastContact).toISOString().split('T')[0] : '',
        (p.notes || '').replace(/"/g, '""').replace(/\n/g, ' '),
      ];
      return fields.map((f) => `"${f}"`).join(',');
    });

    const csv = '\uFEFF' + header + '\n' + rows.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=postman_${new Date().toISOString().split('T')[0]}.csv`,
      },
    });
  } catch (error) {
    console.error('GET /api/postman/export error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export postmen' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/getUser';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const postmen = await prisma.postman.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { interactions: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: postmen,
      count: postmen.length
    });
  } catch (error) {
    console.error('GET /api/postman error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch postmen' },
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
    const { name, company, position, phone, email, category, notes } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const postman = await prisma.postman.create({
      data: {
        userId: user.id!,
        name,
        company,
        position,
        phone,
        email,
        category: category || '포스트맨',
        notes
      }
    });

    return NextResponse.json({
      success: true,
      data: postman
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/postman error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create postman' },
      { status: 500 }
    );
  }
}

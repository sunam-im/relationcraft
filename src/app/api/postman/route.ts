import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 포스트맨 목록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'test-user-id'; // 임시 userId

    const postmen = await prisma.postman.findMany({
      where: { userId },
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

// POST: 새 포스트맨 생성
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, company, position, phone, email, category, notes, userId } = body;

    // 필수 필드 검증
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const postman = await prisma.postman.create({
      data: {
        userId: userId || 'test-user-id', // 임시 userId
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

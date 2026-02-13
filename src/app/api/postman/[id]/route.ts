import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 포스트맨 상세 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postman = await prisma.postman.findUnique({
      where: { id },
      include: {
        interactions: {
          orderBy: { date: 'desc' },
          take: 10 // 최근 10개 상호작용
        }
      }
    });

    if (!postman) {
      return NextResponse.json(
        { success: false, error: 'Postman not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: postman
    });
  } catch (error) {
    console.error('GET /api/postman/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch postman' },
      { status: 500 }
    );
  }
}

// PUT: 포스트맨 수정
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, company, position, phone, email, category, notes, lastContact } = body;

    const postman = await prisma.postman.update({
      where: { id },
      data: {
        name,
        company,
        position,
        phone,
        email,
        category,
        notes,
        lastContact: lastContact ? new Date(lastContact) : undefined
      }
    });

    return NextResponse.json({
      success: true,
      data: postman
    });
  } catch (error) {
    console.error('PUT /api/postman/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update postman' },
      { status: 500 }
    );
  }
}

// DELETE: 포스트맨 삭제
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.postman.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Postman deleted successfully'
    });
  } catch (error) {
    console.error('DELETE /api/postman/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete postman' },
      { status: 500 }
    );
  }
}

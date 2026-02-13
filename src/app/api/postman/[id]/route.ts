import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/getUser';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const postman = await prisma.postman.findUnique({
      where: { id },
      include: {
        interactions: {
          orderBy: { date: 'desc' },
          take: 10
        }
      }
    });

    if (!postman || postman.userId !== user.id) {
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

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

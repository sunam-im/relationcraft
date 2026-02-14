import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/getUser';

async function isAdmin() {
  const sessionUser = await getUser();
  if (!sessionUser?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id }, select: { id: true, role: true } });
  if (!user || user.role !== 'admin') return null;
  return user;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await isAdmin();
    if (!admin) return NextResponse.json({ success: false, error: '권한 없음' }, { status: 403 });

    const { id } = await params;
    const body = await request.json();

    const notice = await prisma.notice.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    await prisma.adminLog.create({ data: { adminId: admin.id, action: 'UPDATE_NOTICE', detail: `공지 수정: ${notice.title}` } });
    return NextResponse.json({ success: true, data: notice });
  } catch (error) {
    console.error('Admin update notice error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await isAdmin();
    if (!admin) return NextResponse.json({ success: false, error: '권한 없음' }, { status: 403 });

    const { id } = await params;
    const notice = await prisma.notice.delete({ where: { id } });

    await prisma.adminLog.create({ data: { adminId: admin.id, action: 'DELETE_NOTICE', detail: `공지 삭제: ${notice.title}` } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete notice error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

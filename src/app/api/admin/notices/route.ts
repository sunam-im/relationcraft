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

export async function GET() {
  try {
    const admin = await isAdmin();
    if (!admin) return NextResponse.json({ success: false, error: '권한 없음' }, { status: 403 });

    const notices = await prisma.notice.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: notices });
  } catch (error) {
    console.error('Admin notices error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await isAdmin();
    if (!admin) return NextResponse.json({ success: false, error: '권한 없음' }, { status: 403 });

    const { title, content } = await request.json();
    if (!title || !content) return NextResponse.json({ success: false, error: '제목과 내용을 입력하세요' }, { status: 400 });

    const notice = await prisma.notice.create({ data: { title, content } });
    await prisma.adminLog.create({ data: { adminId: admin.id, action: 'CREATE_NOTICE', detail: `공지: ${title}` } });

    return NextResponse.json({ success: true, data: notice });
  } catch (error) {
    console.error('Admin create notice error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

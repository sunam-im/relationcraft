import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/getUser';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ success: false, error: '로그인이 필요합니다' }, { status: 401 });

    const { id } = await params;
    const postman = await prisma.postman.findUnique({
      where: { id },
      include: { interactions: { orderBy: { date: 'desc' }, take: 10 } }
    });

    if (!postman) return NextResponse.json({ success: false, error: '포스트맨을 찾을 수 없습니다' }, { status: 404 });

    return NextResponse.json({ success: true, data: postman });
  } catch (error) {
    console.error('GET /api/postman/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch postman' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ success: false, error: '로그인이 필요합니다' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { name, company, position, phone, email, category, notes, profileImage, lastContact, relationship, age, gender, region, strengths, interests, goals, businessSummary, lifePurpose, meetingCount, communicationMeetings, communicationLetters, communicationSNS, communicationGifts, stage } = body;

    const postman = await prisma.postman.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(company !== undefined && { company: company || null }),
        ...(position !== undefined && { position: position || null }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(email !== undefined && { email: email || null }),
        ...(category !== undefined && { category }),
        ...(notes !== undefined && { notes: notes || null }),
        ...(profileImage !== undefined && { profileImage: profileImage || null }),
        ...(lastContact !== undefined && { lastContact: new Date(lastContact) }),
      }
    });

    return NextResponse.json({ success: true, data: postman });
  } catch (error) {
    console.error('PUT /api/postman/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update postman' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ success: false, error: '로그인이 필요합니다' }, { status: 401 });

    const { id } = await params;
    await prisma.postman.delete({ where: { id } });

    return NextResponse.json({ success: true, message: '삭제되었습니다' });
  } catch (error) {
    console.error('DELETE /api/postman/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete postman' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

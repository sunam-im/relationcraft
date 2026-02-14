import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/getUser';

export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ success: false, error: '로그인이 필요합니다' }, { status: 401 });

    const postmen = await prisma.postman.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { interactions: true } } }
    });

    return NextResponse.json({ success: true, data: postmen, count: postmen.length });
  } catch (error) {
    console.error('GET /api/postman error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch postmen' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ success: false, error: '로그인이 필요합니다' }, { status: 401 });

    const body = await request.json();
    const { name, company, position, phone, email, category, notes, profileImage, relationship, age, gender, region, strengths, interests, goals, businessSummary, lifePurpose, meetingCount, communicationMeetings, communicationLetters, communicationSNS, communicationGifts, stage } = body;

    if (!name) return NextResponse.json({ success: false, error: '이름은 필수입니다' }, { status: 400 });

    const postman = await prisma.postman.create({
      data: {
        userId: user.id!,
        name,
        company: company || null,
        position: position || null,
        phone: phone || null,
        email: email || null,
        category: category || '포스트맨',
        notes: notes || null,
        profileImage: profileImage || null,
        relationship: relationship || null,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        region: region || null,
        strengths: strengths || null,
        interests: interests || null,
        goals: goals || null,
        businessSummary: businessSummary || null,
        lifePurpose: lifePurpose || null,
        meetingCount: meetingCount ? parseInt(meetingCount) : 0,
        communicationMeetings: communicationMeetings ? parseInt(communicationMeetings) : 0,
        communicationLetters: communicationLetters ? parseInt(communicationLetters) : 0,
        communicationSNS: communicationSNS ? parseInt(communicationSNS) : 0,
        communicationGifts: communicationGifts ? parseInt(communicationGifts) : 0,
        stage: stage || '첫만남',
      }
    });

    return NextResponse.json({ success: true, data: postman });
  } catch (error) {
    console.error('POST /api/postman error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create postman' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

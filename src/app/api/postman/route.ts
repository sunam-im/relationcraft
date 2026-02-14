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
      include: {
        _count: { select: { interactions: true } },
        interactions: { select: { type: true, date: true }, orderBy: { date: 'desc' } }
      }
    });

    const now = new Date();
    const enriched = postmen.map(p => {
      // 소통 빈도 점수 (최근 90일 소통 횟수, 최대 40점)
      const ninetyDaysAgo = new Date(now.getTime() - 90*24*60*60*1000);
      const recentCount = p.interactions.filter(i => new Date(i.date) >= ninetyDaysAgo).length;
      const frequencyScore = Math.min(recentCount * 5, 40);

      // 최근성 점수 (마지막 소통으로부터 경과일, 최대 30점)
      let recencyScore = 0;
      if (p.lastContact) {
        const daysSince = Math.floor((now.getTime() - new Date(p.lastContact).getTime()) / (1000*60*60*24));
        if (daysSince <= 7) recencyScore = 30;
        else if (daysSince <= 14) recencyScore = 25;
        else if (daysSince <= 30) recencyScore = 20;
        else if (daysSince <= 60) recencyScore = 10;
        else if (daysSince <= 90) recencyScore = 5;
      }

      // Give/Take 균형 점수 (균형일수록 높음, 최대 20점)
      const give = p.interactions.filter(i => i.type === 'GIVE').length;
      const take = p.interactions.filter(i => i.type === 'TAKE').length;
      const total = give + take;
      let balanceScore = 0;
      if (total > 0) {
        const ratio = Math.min(give, take) / Math.max(give, take, 1);
        balanceScore = Math.round(ratio * 20);
      }

      // 프로필 완성도 점수 (최대 10점)
      let profileScore = 0;
      if (p.phone) profileScore += 2;
      if (p.email) profileScore += 2;
      if (p.birthday) profileScore += 2;
      if (p.strengths || p.interests) profileScore += 2;
      if (p.goals || p.businessSummary) profileScore += 2;

      const relationScore = frequencyScore + recencyScore + balanceScore + profileScore;

      const { interactions, ...rest } = p;
      return { ...rest, relationScore, scoreDetail: { frequency: frequencyScore, recency: recencyScore, balance: balanceScore, profile: profileScore } };
    });

    return NextResponse.json({ success: true, data: enriched, count: enriched.length });
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
    const { name, company, position, phone, email, category, notes, profileImage, relationship, age, gender, region, strengths, interests, goals, businessSummary, lifePurpose, birthday, anniversary, anniversaryLabel, meetingCount, communicationMeetings, communicationLetters, communicationSNS, communicationGifts, stage } = body;

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
        birthday: (birthday && birthday.trim()) ? new Date(birthday) : null,
        anniversary: (anniversary && anniversary.trim()) ? new Date(anniversary) : null,
        anniversaryLabel: anniversaryLabel || null,
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

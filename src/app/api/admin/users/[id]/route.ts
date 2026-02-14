import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/getUser';

export const dynamic = 'force-dynamic';

async function isAdmin() {
  const user = await getUser();
  if (!user?.email) return null;
  const dbUser = await prisma.user.findUnique({ where: { email: user.email }, select: { id: true, role: true } });
  if (!dbUser || dbUser.role !== 'admin') return null;
  return dbUser;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  const masked = local.length > 3 ? local.slice(0, 3) + '***' : local.slice(0, 1) + '***';
  return `${masked}@${domain}`;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminUser = await isAdmin();
  if (!adminUser) return NextResponse.json({ success: false, error: '권한 없음' }, { status: 403 });

  const { id } = await params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, role: true, isActive: true,
        createdAt: true, lastLoginAt: true,
        _count: { select: { postmen: true, interactions: true, dailyLogs: true, weeklyPlans: true } }
      }
    });
    if (!user) return NextResponse.json({ success: false, error: '사용자 없음' }, { status: 404 });

    // Give/Take 합산
    const giveTotal = await prisma.interaction.count({ where: { userId: id, type: 'GIVE' } });
    const takeTotal = await prisma.interaction.count({ where: { userId: id, type: 'TAKE' } });

    // 월별 활동 추이 (최근 6개월)
    const monthlyActivity = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i); d.setDate(1);
      const next = new Date(d); next.setMonth(next.getMonth() + 1);
      const label = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const logs = await prisma.dailyLog.count({ where: { userId: id, date: { gte: d, lt: next } } });
      const ints = await prisma.interaction.count({ where: { userId: id, createdAt: { gte: d, lt: next } } });
      monthlyActivity.push({ month: label, dailyLogs: logs, interactions: ints });
    }

    // 파이프라인 분포
    const stages = ['첫만남', '관계형성', '신뢰구축', '포스트맨PLUS', 'VIP'];
    const pipeline: Record<string, number> = {};
    for (const s of stages) {
      pipeline[s] = await prisma.postman.count({ where: { userId: id, stage: s } });
    }

    // 위클리플랜 최근 8주 완료율
    const plans = await prisma.weeklyPlan.findMany({
      where: { userId: id },
      select: { weekStart: true, status1: true, status2: true, status3: true },
      orderBy: { weekStart: 'desc' },
      take: 8
    });
    const weeklyTrend = plans.map(p => {
      const statuses = [p.status1, p.status2, p.status3];
      const done = statuses.filter(s => s === 'DONE').length;
      return { week: p.weekStart.toISOString().split('T')[0], total: 3, done, rate: Math.round((done/3)*100) };
    }).reverse();

    // 데일리로그 최근 90일 작성 여부 (내용 미포함)
    const ninetyDaysAgo = new Date(); ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const logDates = await prisma.dailyLog.findMany({
      where: { userId: id, date: { gte: ninetyDaysAgo } },
      select: { date: true }
    });
    const logDateSet = logDates.map(l => l.date.toISOString().split('T')[0]);

    // 연속 작성 기록
    let currentStreak = 0, maxStreak = 0, tempStreak = 0;
    const allLogDates = await prisma.dailyLog.findMany({
      where: { userId: id }, select: { date: true }, orderBy: { date: 'desc' }
    });
    const sortedDates = allLogDates.map(l => l.date.toISOString().split('T')[0]);
    const today = new Date().toISOString().split('T')[0];
    for (let i = 0; i < sortedDates.length; i++) {
      const expected = new Date(); expected.setDate(expected.getDate() - i);
      const exp = expected.toISOString().split('T')[0];
      if (sortedDates[i] === exp) { currentStreak++; } else break;
    }
    // 최장 연속
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) { tempStreak = 1; }
      else {
        const prev = new Date(sortedDates[i-1]); const curr = new Date(sortedDates[i]);
        const diff = (prev.getTime() - curr.getTime()) / (1000*60*60*24);
        if (diff === 1) tempStreak++; else tempStreak = 1;
      }
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: maskEmail(user.email),
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        postmenCount: user._count.postmen,
        interactionCount: user._count.interactions,
        dailyLogCount: user._count.dailyLogs,
        weeklyPlanCount: user._count.weeklyPlans,
        giveTotal, takeTotal,
        monthlyActivity, pipeline, weeklyTrend,
        logHeatmap: logDateSet,
        currentStreak, maxStreak,
      }
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: '서버 오류' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminUser = await isAdmin();
  if (!adminUser) return NextResponse.json({ success: false, error: '권한 없음' }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { role, isActive } = body;

  try {
    const admin = await isAdmin();

    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await prisma.user.update({ where: { id }, data: updateData });

    // 감사 로그
    await prisma.adminLog.create({
      data: {
        adminId: adminUser.id,
        action: 'USER_UPDATE',
        detail: JSON.stringify({ targetUserId: id, changes: updateData })
      }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: '서버 오류' }, { status: 500 });
  }
}

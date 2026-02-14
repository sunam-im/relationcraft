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

export async function GET() {
  const adminUser = await isAdmin();
  if (!adminUser) return NextResponse.json({ success: false, error: '권한 없음' }, { status: 403 });

  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(today); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 전체 회원 수
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });

    // 오늘 활성 사용자 (데일리로그 또는 소통기록 생성)
    const todayActiveLogs = await prisma.dailyLog.findMany({
      where: { createdAt: { gte: today } },
      select: { userId: true }, distinct: ['userId']
    });
    const todayActiveInteractions = await prisma.interaction.findMany({
      where: { createdAt: { gte: today } },
      select: { userId: true }, distinct: ['userId']
    });
    const todayActiveSet = new Set([
      ...todayActiveLogs.map(l => l.userId),
      ...todayActiveInteractions.map(i => i.userId)
    ]);
    const todayActiveUsers = todayActiveSet.size;

    // 총 포스트맨, 소통 기록
    const totalPostmen = await prisma.postman.count();
    const totalInteractions = await prisma.interaction.count();
    const totalDailyLogs = await prisma.dailyLog.count();

    // 주간 가입자 추이 (최근 7일)
    const weeklySignups = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const count = await prisma.user.count({ where: { createdAt: { gte: d, lt: next } } });
      weeklySignups.push({ date: d.toISOString().split('T')[0], count });
    }

    // 일별 활성 사용자 추이 (최근 7일)
    const weeklyActive = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const logs = await prisma.dailyLog.findMany({
        where: { createdAt: { gte: d, lt: next } },
        select: { userId: true }, distinct: ['userId']
      });
      const ints = await prisma.interaction.findMany({
        where: { createdAt: { gte: d, lt: next } },
        select: { userId: true }, distinct: ['userId']
      });
      const s = new Set([...logs.map(l => l.userId), ...ints.map(i => i.userId)]);
      weeklyActive.push({ date: d.toISOString().split('T')[0], count: s.size });
    }

    // 전체 파이프라인 분포
    const stages = ['첫만남', '관계형성', '신뢰구축', '포스트맨PLUS', 'VIP'];
    const stageDistribution: Record<string, number> = {};
    for (const stage of stages) {
      stageDistribution[stage] = await prisma.postman.count({ where: { stage } });
    }

    // 30일 이상 미활동 비율
    const inactiveUsers = await prisma.user.count({
      where: {
        OR: [
          { lastLoginAt: { lt: thirtyDaysAgo } },
          { lastLoginAt: null }
        ]
      }
    });
    const inactiveRate = totalUsers > 0 ? Math.round((inactiveUsers / totalUsers) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalUsers, activeUsers, todayActiveUsers,
        totalPostmen, totalInteractions, totalDailyLogs,
        weeklySignups, weeklyActive, stageDistribution,
        inactiveRate
      }
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: '서버 오류' }, { status: 500 });
  }
}

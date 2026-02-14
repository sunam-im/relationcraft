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

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // 전체 통계
    const [totalUsers, totalPostmen, totalInteractions, totalDailyLogs, totalWeeklyPlans] = await Promise.all([
      prisma.user.count(),
      prisma.postman.count(),
      prisma.interaction.count(),
      prisma.dailyLog.count(),
      prisma.weeklyPlan.count(),
    ]);

    // Give/Take 비율
    const [giveCount, takeCount] = await Promise.all([
      prisma.interaction.count({ where: { type: 'GIVE' } }),
      prisma.interaction.count({ where: { type: 'TAKE' } }),
    ]);

    // 월별 가입자 (6개월)
    const monthlySignups = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = await prisma.user.count({ where: { createdAt: { gte: start, lt: end } } });
      monthlySignups.push({ month: `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}`, count });
    }

    // 월별 활동량 (6개월)
    const monthlyActivity = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const [interactions, logs] = await Promise.all([
        prisma.interaction.count({ where: { date: { gte: start, lt: end } } }),
        prisma.dailyLog.count({ where: { date: { gte: start, lt: end } } }),
      ]);
      monthlyActivity.push({ month: `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}`, interactions, logs });
    }

    // 인기 카테고리 Top 5
    const categories = await prisma.interaction.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });
    const topCategories = categories.map(c => ({ category: c.category, count: c._count.id }));

    // 파이프라인 단계 분포
    const stages = await prisma.postman.groupBy({
      by: ['stage'],
      _count: { id: true },
    });
    const stageDistribution = stages.map(s => ({ stage: s.stage || 'none', count: s._count.id }));

    // 일평균 (최근 30일)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const [recentInteractions, recentLogs] = await Promise.all([
      prisma.interaction.count({ where: { date: { gte: thirtyDaysAgo } } }),
      prisma.dailyLog.count({ where: { date: { gte: thirtyDaysAgo } } }),
    ]);
    const avgDailyInteractions = Math.round((recentInteractions / 30) * 10) / 10;
    const avgDailyLogs = Math.round((recentLogs / 30) * 10) / 10;

    // 위클리플랜 완료율
    const allPlans = await prisma.weeklyPlan.findMany({ select: { status1: true, status2: true, status3: true } });
    let completed = 0, total = 0;
    allPlans.forEach(p => {
      if (p.status1) { total++; if (p.status1 === 'done') completed++; }
      if (p.status2) { total++; if (p.status2 === 'done') completed++; }
      if (p.status3) { total++; if (p.status3 === 'done') completed++; }
    });
    const weeklyCompletionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // 이탈률 (30일 이상 미활동)
    const activeUsers = await prisma.user.count({ where: { lastLoginAt: { gte: thirtyDaysAgo } } });
    const churnRate = totalUsers > 0 ? Math.round(((totalUsers - activeUsers) / totalUsers) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalUsers, totalPostmen, totalInteractions, totalDailyLogs, totalWeeklyPlans,
        giveCount, takeCount,
        monthlySignups, monthlyActivity, topCategories, stageDistribution,
        avgDailyInteractions, avgDailyLogs, weeklyCompletionRate, churnRate,
      }
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

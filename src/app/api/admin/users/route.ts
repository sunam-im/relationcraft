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

export async function GET() {
  const adminUser = await isAdmin();
  if (!adminUser) return NextResponse.json({ success: false, error: '권한 없음' }, { status: 403 });

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, role: true, isActive: true,
        createdAt: true, lastLoginAt: true,
        _count: {
          select: {
            postmen: true,
            interactions: true,
            dailyLogs: true,
            weeklyPlans: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const now = new Date();
    const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Promise.all(users.map(async (u) => {
      // 최근 30일 데일리로그 작성 일수
      const recentLogs = await prisma.dailyLog.count({
        where: { userId: u.id, date: { gte: thirtyDaysAgo } }
      });

      // 위클리플랜 완료율
      const plans = await prisma.weeklyPlan.findMany({
        where: { userId: u.id },
        select: { status1: true, status2: true, status3: true },
        orderBy: { weekStart: 'desc' },
        take: 8
      });
      let totalPlans = 0, donePlans = 0;
      plans.forEach(p => {
        [p.status1, p.status2, p.status3].forEach(s => {
          if (s && s !== 'TODO') totalPlans++;
          if (s === 'DONE') donePlans++;
        });
      });
      const weeklyRate = totalPlans > 0 ? Math.round((donePlans / totalPlans) * 100) : 0;

      // 파이프라인 분포
      const stages = ['첫만남', '관계형성', '신뢰구축', '포스트맨PLUS', 'VIP'];
      const pipeline: Record<string, number> = {};
      for (const stage of stages) {
        pipeline[stage] = await prisma.postman.count({ where: { userId: u.id, stage } });
      }

      return {
        id: u.id,
        email: maskEmail(u.email),
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt,
        postmenCount: u._count.postmen,
        interactionCount: u._count.interactions,
        dailyLogCount: u._count.dailyLogs,
        weeklyPlanCount: u._count.weeklyPlans,
        recentLogDays: recentLogs,
        weeklyCompletionRate: weeklyRate,
        pipeline,
      };
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    return NextResponse.json({ success: false, error: '서버 오류' }, { status: 500 });
  }
}

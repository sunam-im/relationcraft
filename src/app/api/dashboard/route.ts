import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/getUser';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id!;

    const postmen = await prisma.postman.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    const totalPostmen = postmen.length;
    const totalGiveScore = postmen.reduce((sum, p) => sum + p.giveScore, 0);
    const totalTakeScore = postmen.reduce((sum, p) => sum + p.takeScore, 0);

    const topGive = [...postmen]
      .sort((a, b) => b.giveScore - a.giveScore)
      .slice(0, 5)
      .map((p) => ({ id: p.id, name: p.name, company: p.company, score: p.giveScore }));

    const topTake = [...postmen]
      .sort((a, b) => b.takeScore - a.takeScore)
      .slice(0, 5)
      .map((p) => ({ id: p.id, name: p.name, company: p.company, score: p.takeScore }));

    const topActive = [...postmen]
      .sort((a, b) => (b.giveScore + b.takeScore) - (a.giveScore + a.takeScore))
      .slice(0, 5)
      .map((p) => ({
        id: p.id, name: p.name, company: p.company,
        giveScore: p.giveScore, takeScore: p.takeScore,
        totalScore: p.giveScore + p.takeScore,
      }));

    const categoryCount = postmen.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentInteractions = await prisma.interaction.findMany({
      where: { userId, date: { gte: sixMonthsAgo } },
      orderBy: { date: 'asc' },
      include: { postman: { select: { name: true } } },
    });

    const monthlyStats: Record<string, { give: number; take: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyStats[key] = { give: 0, take: 0 };
    }

    recentInteractions.forEach((item) => {
      const d = new Date(item.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyStats[key]) {
        if (item.type === 'GIVE') monthlyStats[key].give++;
        else monthlyStats[key].take++;
      }
    });

    const monthlyChartData = Object.entries(monthlyStats).map(([month, data]) => ({
      month, label: `${parseInt(month.split('-')[1])}월`, give: data.give, take: data.take,
    }));

    const interactionByCategory: Record<string, number> = {};
    recentInteractions.forEach((item) => {
      interactionByCategory[item.category] = (interactionByCategory[item.category] || 0) + 1;
    });

    const categoryChartData = Object.entries(interactionByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    const latestInteractions = await prisma.interaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10,
      include: { postman: { select: { name: true, company: true } } },
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentLogs = await prisma.dailyLog.findMany({
      where: { userId, date: { gte: sevenDaysAgo } },
      orderBy: { date: 'desc' },
    });

    const logDates = recentLogs.map((log) => new Date(log.date).toISOString().split('T')[0]);

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      last7Days.push({
        date: dateStr,
        dayLabel: d.toLocaleDateString('ko-KR', { weekday: 'short' }),
        hasLog: logDates.includes(dateStr),
      });
    }

    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(today.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    const currentWeekPlan = await prisma.weeklyPlan.findUnique({
      where: { userId_weekStart: { userId, weekStart } },
    });

    const weeklyPlanSummary = currentWeekPlan
      ? {
          plans: [
            { text: currentWeekPlan.plan1, status: currentWeekPlan.status1 },
            { text: currentWeekPlan.plan2, status: currentWeekPlan.status2 },
            { text: currentWeekPlan.plan3, status: currentWeekPlan.status3 },
          ].filter((p) => p.text),
          doneCount: [currentWeekPlan.status1, currentWeekPlan.status2, currentWeekPlan.status3].filter((s) => s === 'DONE').length,
          totalCount: [currentWeekPlan.plan1, currentWeekPlan.plan2, currentWeekPlan.plan3].filter(Boolean).length,
        }
      : null;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const neglectedPostmen = postmen
      .filter((p) => !p.lastContact || new Date(p.lastContact) < thirtyDaysAgo)
      .sort((a, b) => {
        if (!a.lastContact) return -1;
        if (!b.lastContact) return 1;
        return new Date(a.lastContact).getTime() - new Date(b.lastContact).getTime();
      })
      .slice(0, 5)
      .map((p) => ({ id: p.id, name: p.name, company: p.company, lastContact: p.lastContact }));

    return NextResponse.json({
      success: true,
      data: {
        summary: { totalPostmen, totalGiveScore, totalTakeScore, totalInteractions: totalGiveScore + totalTakeScore },
        topGive, topTake, topActive, categoryCount,
        monthlyChartData, categoryChartData, latestInteractions,
        dailyLogStatus: last7Days, weeklyPlanSummary, neglectedPostmen,
      },
    });
  } catch (error) {
    console.error('GET /api/dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

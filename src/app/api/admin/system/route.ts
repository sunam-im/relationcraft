import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/getUser';
import { execSync } from 'child_process';
import os from 'os';
import fs from 'fs';

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

    // CPU
    const cpus = os.cpus();
    const cpuUsage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const idle = cpu.times.idle;
      return acc + ((total - idle) / total) * 100;
    }, 0) / cpus.length;

    // Memory
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsage = ((totalMem - freeMem) / totalMem) * 100;

    // Disk
    let diskUsage = 0, diskTotal = '0', diskUsed = '0';
    try {
      const df = execSync("df -h / | tail -1").toString().trim().split(/\s+/);
      diskTotal = df[1]; diskUsed = df[2]; diskUsage = parseInt(df[4]) || 0;
    } catch {}

    // DB 테이블 카운트
    const [users, postmen, interactions, dailyLogs, weeklyPlans, notices, adminLogs] = await Promise.all([
      prisma.user.count(),
      prisma.postman.count(),
      prisma.interaction.count(),
      prisma.dailyLog.count(),
      prisma.weeklyPlan.count(),
      prisma.notice.count(),
      prisma.adminLog.count(),
    ]);

    // DB 크기
    let dbSize = 'N/A';
    try {
      const result = await prisma.$queryRawUnsafe<Array<{size: string}>>(
        `SELECT pg_size_pretty(pg_database_size(current_database())) as size`
      );
      dbSize = result[0]?.size || 'N/A';
    } catch {}

    // PM2 프로세스
    let pm2Processes: Array<{name: string; status: string; memory: string; uptime: string}> = [];
    try {
      const pm2Json = execSync('pm2 jlist 2>/dev/null').toString();
      const processes = JSON.parse(pm2Json);
      pm2Processes = processes.map((p: any) => ({
        name: p.name,
        status: p.pm2_env?.status || 'unknown',
        memory: `${Math.round((p.monit?.memory || 0) / 1024 / 1024)}MB`,
        uptime: p.pm2_env?.pm_uptime ? `${Math.round((Date.now() - p.pm2_env.pm_uptime) / 1000 / 60)}분` : 'N/A',
      }));
    } catch {}

    // 백업 파일
    let backups: Array<{name: string; size: string; date: string}> = [];
    try {
      const backupDir = '/home/xynet/backups';
      if (fs.existsSync(backupDir)) {
        const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.gz') || f.endsWith('.sql')).sort().reverse().slice(0, 10);
        backups = files.map(f => {
          const stat = fs.statSync(`${backupDir}/${f}`);
          return { name: f, size: `${(stat.size / 1024).toFixed(1)}KB`, date: stat.mtime.toISOString().split('T')[0] };
        });
      }
    } catch {}

    // 최근 관리자 로그
    const recentLogs = await prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, action: true, detail: true, createdAt: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        cpu: { usage: Math.round(cpuUsage), cores: cpus.length },
        memory: { usage: Math.round(memUsage), total: `${(totalMem / 1024 / 1024 / 1024).toFixed(1)}GB`, free: `${(freeMem / 1024 / 1024 / 1024).toFixed(1)}GB` },
        disk: { usage: diskUsage, total: diskTotal, used: diskUsed },
        db: { size: dbSize, tables: { users, postmen, interactions, dailyLogs, weeklyPlans, notices, adminLogs } },
        pm2: pm2Processes,
        backups,
        recentLogs: recentLogs.map(l => ({ ...l, createdAt: l.createdAt.toISOString() })),
      }
    });
  } catch (error) {
    console.error('Admin system error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const admin = await isAdmin();
    if (!admin) return NextResponse.json({ success: false, error: '권한 없음' }, { status: 403 });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `/home/xynet/backups/manual_${timestamp}.sql.gz`;

    try {
      execSync(`mkdir -p /home/xynet/backups`);
      execSync(`pg_dump ${process.env.DATABASE_URL} | gzip > ${backupFile}`, { timeout: 30000 });
    } catch (e: any) {
      return NextResponse.json({ success: false, error: `백업 실패: ${e.message}` }, { status: 500 });
    }

    await prisma.adminLog.create({ data: { adminId: admin.id, action: 'MANUAL_BACKUP', detail: backupFile } });

    return NextResponse.json({ success: true, message: '백업 완료', file: backupFile });
  } catch (error) {
    console.error('Admin backup error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

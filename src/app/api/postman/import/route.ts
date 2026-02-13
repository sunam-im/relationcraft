import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = (formData.get('userId') as string) || 'test-user-id';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'CSV 파일이 필요합니다' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const lines = text.split('\n').filter((line) => line.trim() !== '');

    if (lines.length < 2) {
      return NextResponse.json(
        { success: false, error: 'CSV 파일에 데이터가 없습니다' },
        { status: 400 }
      );
    }

    // 첫 줄은 헤더, 나머지는 데이터
    const dataLines = lines.slice(1);
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < dataLines.length; i++) {
      try {
        const fields = parseCSVLine(dataLines[i]);

        const name = fields[0]?.trim();
        if (!name) {
          failCount++;
          errors.push(`${i + 2}번째 줄: 이름이 없습니다`);
          continue;
        }

        await prisma.postman.create({
          data: {
            userId,
            name,
            company: fields[1]?.trim() || null,
            position: fields[2]?.trim() || null,
            phone: fields[3]?.trim() || null,
            email: fields[4]?.trim() || null,
            category: fields[5]?.trim() || '포스트맨',
            giveScore: parseInt(fields[6]?.trim()) || 0,
            takeScore: parseInt(fields[7]?.trim()) || 0,
            lastContact: fields[8]?.trim() ? new Date(fields[8].trim()) : null,
            notes: fields[9]?.trim() || null,
          },
        });

        successCount++;
      } catch (err) {
        failCount++;
        errors.push(`${i + 2}번째 줄: 처리 중 오류 발생`);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        successCount,
        failCount,
        errors: errors.slice(0, 10),
      },
    });
  } catch (error) {
    console.error('POST /api/postman/import error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import postmen' },
      { status: 500 }
    );
  }
}

// CSV 한 줄을 파싱 (큰따옴표 처리)
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }

  fields.push(current);
  return fields;
}

export const dynamic = 'force-dynamic';

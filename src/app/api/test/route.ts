import { NextResponse } from 'next/server';

export async function GET() {
  console.log('API /api/test called!');
  return NextResponse.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
}

export const dynamic = 'force-dynamic';

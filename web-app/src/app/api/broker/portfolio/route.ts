import { NextResponse } from 'next/server';
import { mockPortfolio } from '../../broker/mockData';

export async function GET() {
  const data = mockPortfolio();
  return NextResponse.json(data);
}


import { NextResponse } from 'next/server';
import { mockPositions } from '../../broker/mockData';

export async function GET() {
  const data = mockPositions();
  return NextResponse.json(data);
}


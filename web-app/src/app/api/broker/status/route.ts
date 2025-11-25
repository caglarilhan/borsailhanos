import { NextResponse } from 'next/server';
import { mockStatus } from '../../broker/mockData';

export async function GET() {
  const data = mockStatus();
  return NextResponse.json(data);
}


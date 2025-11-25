import { NextResponse } from 'next/server';
import { mockAccounts } from '../../broker/mockData';

export async function GET() {
  const data = mockAccounts();
  return NextResponse.json(data);
}


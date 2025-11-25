import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const rootDir = process.cwd();
const logPath = path.join(rootDir, 'logs', 'ai_order_history.jsonl');

interface AiOrderLog {
  broker: string;
  symbol: string;
  quantity: number;
  order_type: string;
  price?: number | null;
  order_id: string;
  status: string;
  timestamp?: string;
  source?: string;
}

async function readLogs(limit = 100): Promise<AiOrderLog[]> {
  try {
    const content = await fs.readFile(logPath, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean).slice(-limit);
    return lines.map((line) => {
      try {
        return JSON.parse(line) as AiOrderLog;
      } catch (error) {
        return null;
      }
    }).filter(Boolean) as AiOrderLog[];
  } catch (error) {
    return [];
  }
}

export async function GET() {
  const logs = await readLogs();
  return NextResponse.json({ logs });
}

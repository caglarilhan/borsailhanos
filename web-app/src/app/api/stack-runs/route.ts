import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const rootDir = process.cwd();
const logPath = path.join(rootDir, 'logs', 'stack_runs.jsonl');

async function readJsonl(logFile: string, limit = 100) {
  const content = await fs.readFile(logFile, 'utf8');
  return content
    .trim()
    .split('\n')
    .filter(Boolean)
    .slice(-limit)
    .map((line) => JSON.parse(line));
}

export async function GET() {
  try {
    const runs = await readJsonl(logPath, 50);
    return NextResponse.json({ runs: runs.reverse() });
  } catch (error) {
    return NextResponse.json({ runs: [] });
  }
}

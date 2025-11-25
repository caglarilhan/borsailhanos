import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

type EndpointStatus = {
  name: string;
  status: 'up' | 'down';
  detail?: string;
  latency_ms?: number;
  lastUpdated?: string;
};

async function pingJson(url: string, label: string): Promise<EndpointStatus> {
  const start = performance.now();
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const latency_ms = performance.now() - start;
    if (!res.ok) {
      return { name: label, status: 'down', detail: `HTTP ${res.status}`, latency_ms };
    }
    const json = await res.json();
    return {
      name: label,
      status: 'up',
      latency_ms,
      lastUpdated: json.generatedAt || json.updatedAt || json.finished_at,
      detail: json.mode || undefined,
    };
  } catch (error: any) {
    return { name: label, status: 'down', detail: error?.message || 'fetch failed' };
  }
}

async function checkSnapshots(): Promise<EndpointStatus[]> {
  const rootDir = process.cwd();
  const sentimentPath = path.join(rootDir, 'data', 'snapshots', 'us_sentiment_sample.json');
  const marketPath = path.join(rootDir, 'data', 'snapshots', 'us_market_snapshot.json');
  const results: EndpointStatus[] = [];
  for (const [name, filePath] of [
    ['us_sentiment_sample', sentimentPath],
    ['us_market_snapshot', marketPath],
  ]) {
    try {
      const stat = await fs.stat(filePath);
      results.push({
        name,
        status: 'up',
        lastUpdated: stat.mtime.toISOString(),
      });
    } catch (error: any) {
      results.push({ name, status: 'down', detail: error?.message });
    }
  }
  return results;
}

export async function GET(request: Request) {
  const base =
    process.env.HEALTH_BASE_URL && process.env.HEALTH_BASE_URL.length > 0
      ? process.env.HEALTH_BASE_URL.replace(/\/$/, '')
      : new URL(request.url).origin;
  const endpoints = await Promise.all([
    pingJson(`${base}/api/ai/us-sentiment`, 'us-sentiment'),
    pingJson(`${base}/api/markets/us`, 'us-market'),
    pingJson(`${base}/api/ai/global-bias`, 'global-bias'),
  ]);
  const snapshots = await checkSnapshots();
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    endpoints,
    snapshots,
  });
}

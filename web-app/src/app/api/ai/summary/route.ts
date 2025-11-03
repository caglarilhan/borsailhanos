import { NextResponse } from 'next/server';

export async function GET() {
  // Mock birleşik AI özeti; backend gerçek veriye bağlandığında burası güncellenecek
  const data = {
    updatedAt: Date.now(),
    sentences: [
      'BIST %68 pozitif, NASDAQ nötr. En güçlü sektör: Teknoloji (+3.8%).',
      'Ortalama model doğruluğu: %87.3 (Meta-Model-v2.2).',
      '5 öneri: THYAO, EREGL, AKBNK, NVDA, AAPL. Tahmini portföy getirisi: +8.2%, Risk skoru: 3.1 (Düşük).'
    ],
    source: 'AI_summary v1 • FinBERT-TR + MetaModel US',
  };
  return NextResponse.json(data);
}



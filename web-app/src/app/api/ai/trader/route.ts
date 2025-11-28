import { NextResponse } from 'next/server';

type TraderRequest = {
  prompt?: string;
  focusSymbol?: string;
};

const defaultResponse =
  'Bu konuda size yardımcı olabilirim. Hisseler, risk analizi, portföy optimizasyonu veya al/sat seviyeleri hakkında soru sorabilirsiniz.';

const suggestionMap: Record<string, { reply: string; focusSymbols: string[] }> = {
  hisseler:
    'Bugün en dikkat çeken sinyaller: THYAO (Momentum BUY), AKBNK (RL Hedge), EREGL (EMA kırılımı). THYAO için hedef 255 ₺, stop 240 ₺.',
  risk:
    'Portföy riski şu anda DÜŞÜK (CVaR %3.1). En yüksek ağırlık THYAO %38. Hedge için XBANK short + VIOP30 mini kontratı öneriliyor.',
  portföy:
    'AI optimizer önerisi: THYAO %35, AKBNK %35, EREGL %30. Bu dağılımla Sharpe 1.92, beklenen yıllık getiri %18.7.',
  'al/sat':
    'AI sinyalleri: THYAO BUY (güven %86), AKBNK HOLD, EREGL SELL (%72). Yeni fırsatlar için TUPRS ve SISE radar listesinde.',
};

export async function POST(request: Request) {
  try {
    const body: TraderRequest = await request.json();
    const prompt = body.prompt?.toLowerCase() ?? '';

    let key: keyof typeof suggestionMap | null = null;
    if (prompt.includes('risk')) key = 'risk';
    else if (prompt.includes('portföy') || prompt.includes('portfolio')) key = 'portföy';
    else if (prompt.includes('al') || prompt.includes('sat')) key = 'al/sat';
    else if (prompt.includes('hisse') || prompt.includes('izle')) key = 'hisseler';

    const payload = key ? suggestionMap[key] : { reply: defaultResponse, focusSymbols: [] };

    return NextResponse.json({
      reply: payload.reply,
      focusSymbols: payload.focusSymbols,
      timestamp: Date.now(),
      source: 'TraderGPT',
    });
  } catch (error) {
    console.error('[TRADER_GPT_API] error', error);
    return NextResponse.json(
      { reply: defaultResponse, focusSymbols: [], timestamp: Date.now(), source: 'TraderGPT' },
      { status: 200 },
    );
  }
}


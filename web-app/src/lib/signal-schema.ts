import { z } from 'zod';

export const StopsSchema = z.object({ hard: z.number().positive(), trailing: z.number().positive().optional() });
export const XAISchema = z.object({ rsi: z.number(), macd: z.number(), sentiment: z.number(), volume: z.number(), weights: z.record(z.number()).optional(), deltasBp: z.array(z.object({ label: z.string(), bp: z.number() })).optional() });
export const MetaSchema = z.object({ updatedAt: z.string(), tz: z.literal('UTC+3'), dataVersion: z.string() });

export const SignalSchema = z.object({
  symbol: z.string(),
  price: z.number().positive(),
  target: z.number().positive(),
  changePct: z.number(),
  confidence: z.number().min(0).max(1),
  horizon: z.enum(['5m','15m','30m','1h','4h','1d']),
  bestHorizon: z.enum(['5m','15m','30m','1h','4h','1d']).optional(),
  ttlSec: z.number().int().nonnegative(),
  stops: StopsSchema,
  xai: XAISchema,
  meta: MetaSchema,
});

export type UISignal = z.infer<typeof SignalSchema>;



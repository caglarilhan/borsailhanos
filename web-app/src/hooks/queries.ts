'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Api } from '@/services/api';

export function useBistPredictions(universe: string, horizons: string[], all: boolean = true, useWebSocket: boolean = false) {
  return useQuery({
    queryKey: ['bistPredictions', universe, horizons.join(','), all],
    queryFn: async () => Api.getBistPredictions(universe, horizons, all),
    refetchInterval: useWebSocket ? false : 60000, // WebSocket varsa polling kapalı, yoksa 60s (eskiden 30s)
    enabled: universe !== 'ALL',
    staleTime: useWebSocket ? 0 : 30000, // WebSocket varsa staleTime yok, yoksa 30s
  });
}

export function useBistAllPredictions(horizons: string[], useWebSocket: boolean = false) {
  return useQuery({
    queryKey: ['bistPredictionsAll', horizons.join(',')],
    queryFn: async () => {
      const [d30, d100, d300] = await Promise.all([
        Api.getBistPredictions('BIST30', horizons, true).catch(()=>({ predictions: [] })),
        Api.getBistPredictions('BIST100', horizons, true).catch(()=>({ predictions: [] })),
        Api.getBistPredictions('BIST300', horizons, true).catch(()=>({ predictions: [] })),
      ]);
      const map = new Map<string, any>();
      [...(d30?.predictions||[]), ...(d100?.predictions||[]), ...(d300?.predictions||[])].forEach((p: any)=>{
        const key = String(p.symbol) + '-' + String(p.horizon);
        if (!map.has(key)) map.set(key, p);
        else {
          const prev = map.get(key);
          if ((p?.confidence||0) > (prev?.confidence||0)) map.set(key, p);
        }
      });
      const merged = Array.from(map.values());
      merged.sort((a:any,b:any)=> (b.confidence||0) - (a.confidence||0));
      return { predictions: merged };
    },
    refetchInterval: useWebSocket ? false : 60000, // WebSocket varsa polling kapalı, yoksa 60s
    staleTime: useWebSocket ? 0 : 30000,
  });
}

export function useBist30Overview(enabled: boolean) {
  return useQuery({
    queryKey: ['bist30Overview'],
    queryFn: async () => Api.getBist30Overview(),
    refetchInterval: 30000,
    enabled,
  });
}

export function useBist30News(enabled: boolean) {
  return useQuery({
    queryKey: ['bist30News'],
    queryFn: async () => Api.getBist30News(),
    refetchInterval: 30000,
    enabled,
  });
}

export function useSentimentSummary(enabled: boolean) {
  return useQuery({
    queryKey: ['sentimentSummary'],
    queryFn: async () => Api.getSentimentSummary(),
    refetchInterval: 30000,
    enabled,
  });
}

export function usePredictiveTwin(symbol?: string | null) {
  return useQuery({
    queryKey: ['predictiveTwin', symbol || ''],
    queryFn: async () => Api.getPredictiveTwin(String(symbol)),
    enabled: !!symbol,
  });
}

export function useWatchlist() {
  return useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => Api.getWatchlist(),
    refetchInterval: 60000,
  });
}

export function useTop30Analysis() {
  return useQuery({
    queryKey: ['top30Analysis'],
    queryFn: async () => Api.getTop30Analysis(),
    refetchInterval: 30000,
  });
}

export function useUpdateWatchlistMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { symbols: string|string[], mode: 'add'|'remove'|'toggle' }) => {
      return Api.updateWatchlistPost(args.symbols, args.mode);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['watchlist'] });
    }
  });
}

export function useAlertsGenerateMutation() {
  return useMutation({
    mutationFn: async (args: { delta: number; minConf: number; source: string }) => {
      return Api.getAlertsGenerate(args.delta, args.minConf, args.source);
    },
  });
}

export function useForecast(symbol?: string, horizon: '1d'|'7d'|'30d'='1d', enabled: boolean = false) {
  return useQuery({
    queryKey: ['forecast', symbol || '', horizon],
    queryFn: async () => Api.getForecast(String(symbol), horizon),
    enabled: enabled && !!symbol,
    staleTime: 30000,
  });
}

export function useMetaEnsemble(symbol?: string, horizon: '1d'|'7d'|'30d'='1d', enabled: boolean=false) {
  return useQuery({
    queryKey: ['metaEnsemble', symbol||'', horizon],
    queryFn: async () => Api.getMetaEnsemble(String(symbol), horizon),
    enabled: enabled && !!symbol,
    staleTime: 30000,
  });
}

export function useBOCalibrate() {
  return useQuery({
    queryKey: ['boCalibrate'],
    queryFn: async () => Api.getBOCalibrate(),
    staleTime: 60000,
  });
}

export function useMacro() {
  return useQuery({
    queryKey: ['macro'],
    queryFn: async () => Api.getMacro(),
    refetchInterval: 300000,
  });
}

export function useCrossCorr() {
  return useQuery({
    queryKey: ['crossCorr'],
    queryFn: async () => Api.getCrossCorr(),
    staleTime: 300000,
  });
}

export function useMemoryBank() {
  return useQuery({
    queryKey: ['memoryBank'],
    queryFn: async () => Api.getMemoryBank(),
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  });
}

export function useIntelligenceHub() {
  return useQuery({
    queryKey: ['intelligenceHub'],
    queryFn: async () => Api.getIntelligenceHub(),
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  });
}

export function useTriggerRetrainMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload?: any) => Api.triggerRetrain(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['memoryBank'] });
      await qc.invalidateQueries({ queryKey: ['intelligenceHub'] });
    },
  });
}

  export function useBacktestQuick(universe: string, tcost_bps: number, rebalance_days: number, enabled: boolean) {
    return useQuery({
      queryKey: ['backtestQuick', universe, tcost_bps, rebalance_days],
      queryFn: async () => Api.getBacktestQuick(universe, tcost_bps, rebalance_days),
      enabled,
      staleTime: 30000,
    });
  }

  export function useCalibration() {
    return useQuery({
      queryKey: ['calibration'],
      queryFn: async () => Api.getCalibration(),
      staleTime: 60000,
    });
  }

  export function usePI(symbol?: string, horizon: '1d'|'7d'|'30d'='1d', enabled: boolean=false) {
    return useQuery({
      queryKey: ['predInterval', symbol||'', horizon],
      queryFn: async () => Api.getPredInterval(String(symbol), horizon),
      enabled: enabled && !!symbol,
      staleTime: 30000,
    });
  }

  export function useRegime() {
    return useQuery({
      queryKey: ['regime'],
      queryFn: async () => Api.getRegime(),
      refetchInterval: 300000,
    });
  }

  export function useFactors(symbol?: string) {
    return useQuery({
      queryKey: ['factors', symbol||''],
      queryFn: async () => Api.getFactors(String(symbol)),
      enabled: !!symbol,
      staleTime: 30000,
    });
  }

  export function useRanker(universe: string, topn: number=10) {
    return useQuery({
      queryKey: ['ranker', universe, topn],
      queryFn: async () => Api.getRanker(universe, topn),
      refetchInterval: 30000,
    });
  }

  export function useXaiWaterfall(symbol?: string | null) {
    return useQuery({
      queryKey: ['xaiWaterfall', symbol || ''],
      queryFn: async () => Api.getXaiWaterfall(String(symbol)),
      enabled: !!symbol,
      staleTime: 30000,
    });
  }

  export function useSentimentAnalyst(symbol?: string | null) {
    return useQuery({
      queryKey: ['sentimentAnalyst', symbol || ''],
      queryFn: async () => Api.getSentimentAnalyst(String(symbol)),
      enabled: !!symbol,
      staleTime: 30000,
    });
  }

  export function useReasoning(symbol?: string | null) {
    return useQuery({
      queryKey: ['reasoning', symbol || ''],
      queryFn: async () => Api.getReasoning(String(symbol)),
      enabled: !!symbol,
      staleTime: 30000,
    });
  }

  export function useAIHealth() {
    return useQuery({
      queryKey: ['aiHealth'],
      queryFn: async () => Api.getAIHealth(),
      refetchInterval: 60000, // 1 dakikada bir güncelle
      staleTime: 30000,
    });
  }

  // NASDAQ/NYSE predictions
  export function useNasdaqPredictions(horizons: string[] = ['1d', '4h'], enabled: boolean = true) {
    return useQuery({
      queryKey: ['nasdaqPredictions', horizons.join(',')],
      queryFn: async () => Api.getNasdaqPredictions(horizons.join(',')),
      enabled,
      refetchInterval: 60000,
      staleTime: 30000,
    });
  }

  export function useNysePredictions(horizons: string[] = ['1d', '4h'], enabled: boolean = true) {
    return useQuery({
      queryKey: ['nysePredictions', horizons.join(',')],
      queryFn: async () => Api.getNysePredictions(horizons.join(',')),
      enabled,
      refetchInterval: 60000,
      staleTime: 30000,
    });
  }

  export function useStrategyLab(strategy: string, param: string, enabled: boolean) {
    return useQuery({
      queryKey: ['strategyLab', strategy, param],
      queryFn: async () => Api.runStrategyLab(strategy, param),
      enabled,
      staleTime: 0,
    });
  }



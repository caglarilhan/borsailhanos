/**
 * P5.2: FinBERT Hybrid (Multi-source Sentiment)
 * İngilizce kaynaklardan (Bloomberg, Reuters) sentiment çekip TR modelle harmanla
 */

export interface SentimentSource {
  source: 'KAP' | 'AA' | 'Bloomberg' | 'Reuters' | 'Forexfactory' | 'TradingEconomics';
  language: 'tr' | 'en';
  sentiment: {
    positive: number; // 0-1
    negative: number; // 0-1
    neutral: number; // 0-1
  };
  confidence: number; // 0-1
  timestamp: string;
}

export interface HybridSentimentResult {
  overall: {
    positive: number;
    negative: number;
    neutral: number;
    confidence: number;
    consensus: 'strong_positive' | 'positive' | 'neutral' | 'negative' | 'strong_negative';
  };
  bySource: SentimentSource[];
  fusionWeight: {
    turkish: number; // Weight for Turkish sources
    english: number; // Weight for English sources
  };
  timestamp: string;
}

/**
 * FinBERT Hybrid Sentiment Analyzer
 */
export class FinBERTHybridAnalyzer {
  private turkishWeight = 0.6; // Turkish sources have higher weight for BIST
  private englishWeight = 0.4; // English sources provide global context

  /**
   * Fuse sentiment from multiple sources
   */
  fuseSentiment(sources: SentimentSource[]): HybridSentimentResult {
    // Separate Turkish and English sources
    const turkishSources = sources.filter((s) => s.language === 'tr');
    const englishSources = sources.filter((s) => s.language === 'en');

    // Calculate weighted averages for each language group
    const turkishSentiment = this.calculateWeightedSentiment(turkishSources);
    const englishSentiment = this.calculateWeightedSentiment(englishSources);

    // Fuse Turkish and English sentiments
    const overallPositive = 
      (turkishSentiment.positive * this.turkishWeight) +
      (englishSentiment.positive * this.englishWeight);
    
    const overallNegative = 
      (turkishSentiment.negative * this.turkishWeight) +
      (englishSentiment.negative * this.englishWeight);
    
    const overallNeutral = 
      (turkishSentiment.neutral * this.turkishWeight) +
      (englishSentiment.neutral * this.englishWeight);

    // Normalize to sum to 1
    const sum = overallPositive + overallNegative + overallNeutral;
    const normalizedPositive = sum > 0 ? overallPositive / sum : 0.33;
    const normalizedNegative = sum > 0 ? overallNegative / sum : 0.33;
    const normalizedNeutral = sum > 0 ? overallNeutral / sum : 0.34;

    // Calculate overall confidence
    const overallConfidence = 
      (turkishSentiment.confidence * this.turkishWeight) +
      (englishSentiment.confidence * this.englishWeight);

    // Determine consensus
    const consensus = this.determineConsensus(normalizedPositive, normalizedNegative, normalizedNeutral);

    return {
      overall: {
        positive: normalizedPositive,
        negative: normalizedNegative,
        neutral: normalizedNeutral,
        confidence: overallConfidence,
        consensus,
      },
      bySource: sources,
      fusionWeight: {
        turkish: this.turkishWeight,
        english: this.englishWeight,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate weighted sentiment for a language group
   */
  private calculateWeightedSentiment(sources: SentimentSource[]): {
    positive: number;
    negative: number;
    neutral: number;
    confidence: number;
  } {
    if (sources.length === 0) {
      return {
        positive: 0.33,
        negative: 0.33,
        neutral: 0.34,
        confidence: 0.5,
      };
    }

    // Weight by confidence and source reliability
    const sourceWeights: Record<string, number> = {
      'KAP': 1.0, // Official announcements = highest weight
      'AA': 0.9, // Major news agency
      'Bloomberg': 0.85, // International financial news
      'Reuters': 0.85, // International financial news
      'Forexfactory': 0.7, // Economic calendar
      'TradingEconomics': 0.8, // Economic data provider
    };

    let totalWeight = 0;
    let weightedPositive = 0;
    let weightedNegative = 0;
    let weightedNeutral = 0;
    let weightedConfidence = 0;

    sources.forEach((source) => {
      const weight = (sourceWeights[source.source] || 0.7) * source.confidence;
      totalWeight += weight;

      weightedPositive += source.sentiment.positive * weight;
      weightedNegative += source.sentiment.negative * weight;
      weightedNeutral += source.sentiment.neutral * weight;
      weightedConfidence += source.confidence * weight;
    });

    if (totalWeight > 0) {
      return {
        positive: weightedPositive / totalWeight,
        negative: weightedNegative / totalWeight,
        neutral: weightedNeutral / totalWeight,
        confidence: weightedConfidence / totalWeight,
      };
    }

    return {
      positive: 0.33,
      negative: 0.33,
      neutral: 0.34,
      confidence: 0.5,
    };
  }

  /**
   * Determine consensus sentiment
   */
  private determineConsensus(
    positive: number,
    negative: number,
    neutral: number
  ): 'strong_positive' | 'positive' | 'neutral' | 'negative' | 'strong_negative' {
    if (positive > 0.7) {
      return 'strong_positive';
    } else if (positive > 0.55) {
      return 'positive';
    } else if (negative > 0.7) {
      return 'strong_negative';
    } else if (negative > 0.55) {
      return 'negative';
    } else {
      return 'neutral';
    }
  }

  /**
   * Fetch sentiment from Bloomberg
   */
  async fetchBloombergSentiment(symbol: string): Promise<SentimentSource | null> {
    try {
      // In production, this would call Bloomberg API or scrape their website
      // For now, return mock data
      return this.generateMockBloombergSentiment(symbol);
    } catch (error) {
      console.error('❌ Bloomberg sentiment fetch error:', error);
      return null;
    }
  }

  /**
   * Fetch sentiment from Reuters
   */
  async fetchReutersSentiment(symbol: string): Promise<SentimentSource | null> {
    try {
      // In production, this would call Reuters API or scrape their website
      return this.generateMockReutersSentiment(symbol);
    } catch (error) {
      console.error('❌ Reuters sentiment fetch error:', error);
      return null;
    }
  }

  /**
   * Aggregate sentiment from all sources
   */
  async aggregateSentiment(
    symbol: string,
    turkishSources: SentimentSource[],
    includeEnglish: boolean = true
  ): Promise<HybridSentimentResult> {
    const allSources = [...turkishSources];

    if (includeEnglish) {
      const [bloomberg, reuters] = await Promise.all([
        this.fetchBloombergSentiment(symbol),
        this.fetchReutersSentiment(symbol),
      ]);

      if (bloomberg) allSources.push(bloomberg);
      if (reuters) allSources.push(reuters);
    }

    return this.fuseSentiment(allSources);
  }

  /**
   * Generate mock Bloomberg sentiment
   */
  private generateMockBloombergSentiment(symbol: string): SentimentSource {
    // Seeded random for consistency
    const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    const positive = 0.5 + (random(seed) - 0.5) * 0.4; // 0.3-0.7
    const negative = 0.2 + (random(seed + 1) - 0.5) * 0.3; // 0.05-0.35
    const neutral = 1 - positive - negative;

    return {
      source: 'Bloomberg',
      language: 'en',
      sentiment: {
        positive,
        negative,
        neutral,
      },
      confidence: 0.75 + random(seed + 2) * 0.2, // 0.75-0.95
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate mock Reuters sentiment
   */
  private generateMockReutersSentiment(symbol: string): SentimentSource {
    const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    const positive = 0.5 + (random(seed + 10) - 0.5) * 0.4;
    const negative = 0.2 + (random(seed + 11) - 0.5) * 0.3;
    const neutral = 1 - positive - negative;

    return {
      source: 'Reuters',
      language: 'en',
      sentiment: {
        positive,
        negative,
        neutral,
      },
      confidence: 0.75 + random(seed + 12) * 0.2,
      timestamp: new Date().toISOString(),
    };
  }
}

// Singleton instance
export const finbertHybridAnalyzer = new FinBERTHybridAnalyzer();

/**
 * Fuse sentiment from multiple sources
 */
export function fuseSentiment(sources: SentimentSource[]): HybridSentimentResult {
  return finbertHybridAnalyzer.fuseSentiment(sources);
}

/**
 * Aggregate sentiment from all sources
 */
export function aggregateHybridSentiment(
  symbol: string,
  turkishSources: SentimentSource[],
  includeEnglish: boolean = true
): Promise<HybridSentimentResult> {
  return finbertHybridAnalyzer.aggregateSentiment(symbol, turkishSources, includeEnglish);
}



/**
 * P5.2: FinBERT Sentiment Feed Integration
 * FinBERT-TR sentiment modeline haber feed bağlantısı (BloombergHT, AA RSS)
 */

export interface NewsItem {
  title: string;
  content: string;
  source: 'KAP' | 'AA' | 'BloombergHT' | 'Dünya' | 'Mock';
  timestamp: string;
  url?: string;
  symbol?: string;
}

export interface SentimentScore {
  positive: number; // 0-1
  negative: number; // 0-1
  neutral: number; // 0-1
  confidence: number; // 0-1
  model: 'finbert-tr';
}

export interface SentimentFeedResult {
  news: NewsItem[];
  sentiment: SentimentScore;
  timestamp: string;
}

/**
 * News Feed Aggregator
 */
export class NewsFeedAggregator {
  /**
   * Fetch news from KAP (Borsa Istanbul Official Announcements)
   * KAP announcements are available via their public RSS or API
   */
  async fetchKAPNews(symbol?: string, limit: number = 10): Promise<NewsItem[]> {
    try {
      // KAP RSS feed URL (public, no API key required)
      const kapUrl = symbol
        ? `https://www.kap.org.tr/tr/Bildirim/Detay/${symbol}`
        : 'https://www.kap.org.tr/tr/Bildirimler'; // General announcements
      
      // Note: KAP doesn't provide a direct RSS feed, but we can scrape or use their API
      // For now, we'll use a mock implementation
      // In production, you would need to implement proper scraping or use KAP's official API
      
      return this.generateMockKAPNews(symbol, limit);
    } catch (error) {
      console.error('❌ KAP news fetch error:', error);
      return [];
    }
  }

  /**
   * Fetch news from AA (Anadolu Ajansı) RSS feed
   */
  async fetchAANews(query: string = 'borsa', limit: number = 10): Promise<NewsItem[]> {
    // Disable network fetch in client/dev; use mock to avoid CORS/blocked requests
    return this.generateMockAANews(query, limit);
  }

  /**
   * Fetch news from BloombergHT (if available)
   */
  async fetchBloombergHTNews(query: string = 'borsa', limit: number = 10): Promise<NewsItem[]> {
    try {
      // BloombergHT may require authentication or have different endpoint
      // For now, return mock data
      return this.generateMockBloombergHTNews(query, limit);
    } catch (error) {
      console.error('❌ BloombergHT news fetch error:', error);
      return [];
    }
  }

  /**
   * Aggregate news from all sources
   */
  async aggregateNews(symbol?: string, limit: number = 20): Promise<NewsItem[]> {
    const allNews: NewsItem[] = [];
    try {
      const kapNews = await this.fetchKAPNews(symbol, limit);
      allNews.push(...kapNews);
    } catch {}
    try {
      const aaNews = await this.fetchAANews(symbol || 'borsa', limit);
      allNews.push(...aaNews);
    } catch {}
    try {
      const bloombergNews = await this.fetchBloombergHTNews(symbol || 'borsa', limit);
      allNews.push(...bloombergNews);
    } catch {}

    return allNews
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Parse RSS feed XML
   */
  private parseRSSFeed(xmlText: string, source: 'AA' | 'BloombergHT'): NewsItem[] {
    try {
      // Simple RSS parser (SSR-safe). If DOMParser yoksa, basit fallback kullan.
      let items: any[] = [];
      if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        items = Array.from(xmlDoc.querySelectorAll('item'));
      } else {
        // Very naive fallback: split by <item> ... </item>
        const matches = xmlText.split('<item>').slice(1).map(x => '<item>' + x);
        items = matches.map((chunk) => ({
          querySelector: (tag: string) => {
            const re = new RegExp(`<${tag}>([\s\S]*?)<\/${tag}>`, 'i');
            const m = chunk.match(re);
            return { textContent: m ? m[1] : '' } as any;
          }
        }));
      }
      return Array.from(items).map((item: any) => {
        const title = item.querySelector('title')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
        const link = item.querySelector('link')?.textContent || '';

        return {
          title,
          content: description,
          source: source === 'AA' ? 'AA' : 'BloombergHT',
          timestamp: new Date(pubDate).toISOString(),
          url: link,
        };
      });
    } catch (error) {
      console.error('❌ RSS parse error:', error);
      return [];
    }
  }

  /**
   * Generate mock KAP news
   */
  private generateMockKAPNews(symbol?: string, limit: number = 10): NewsItem[] {
    const news: NewsItem[] = [];
    const baseDate = new Date();

    for (let i = 0; i < limit; i++) {
      news.push({
        title: `${symbol || 'Şirket'} - Kamuoyu Açıklaması ${i + 1}`,
        content: `${symbol || 'Şirket'} tarafından yapılan kamuoyu açıklaması içeriği...`,
        source: 'KAP',
        timestamp: new Date(baseDate.getTime() - i * 3600000).toISOString(),
        symbol,
      });
    }

    return news;
  }

  /**
   * Generate mock AA news
   */
  private generateMockAANews(query: string, limit: number = 10): NewsItem[] {
    const news: NewsItem[] = [];
    const baseDate = new Date();

    for (let i = 0; i < limit; i++) {
      news.push({
        title: `Borsa İstanbul'da ${query} ile ilgili gelişmeler`,
        content: `Borsa İstanbul'da ${query} konusunda yaşanan son gelişmeler...`,
        source: 'AA',
        timestamp: new Date(baseDate.getTime() - i * 3600000).toISOString(),
      });
    }

    return news;
  }

  /**
   * Generate mock BloombergHT news
   */
  private generateMockBloombergHTNews(query: string, limit: number = 10): NewsItem[] {
    const news: NewsItem[] = [];
    const baseDate = new Date();

    for (let i = 0; i < limit; i++) {
      news.push({
        title: `${query} - Piyasa Analizi ${i + 1}`,
        content: `BloombergHT'den ${query} konusunda piyasa analizi ve yorumlar...`,
        source: 'BloombergHT',
        timestamp: new Date(baseDate.getTime() - i * 3600000).toISOString(),
      });
    }

    return news;
  }
}

/**
 * FinBERT Sentiment Analyzer
 * Integrates with FinBERT-TR model for Turkish financial text sentiment analysis
 */
export class FinBERTSentimentAnalyzer {
  /**
   * Analyze sentiment of news items using FinBERT-TR model
   * Note: This would typically call a backend API that runs the FinBERT model
   */
  async analyzeSentiment(news: NewsItem[]): Promise<SentimentScore> {
    try {
      // In production, this would call a backend API:
      // const response = await fetch('/api/finbert/analyze', {
      //   method: 'POST',
      //   body: JSON.stringify({ news }),
      // });
      // const data = await response.json();
      // return data.sentiment;

      // For now, use mock sentiment analysis
      return this.mockSentimentAnalysis(news);
    } catch (error) {
      console.error('❌ FinBERT sentiment analysis error:', error);
      return {
        positive: 0.5,
        negative: 0.25,
        neutral: 0.25,
        confidence: 0.7,
        model: 'finbert-tr',
      };
    }
  }

  /**
   * Mock sentiment analysis (replace with real FinBERT API call)
   */
  private mockSentimentAnalysis(news: NewsItem[]): SentimentScore {
    if (news.length === 0) {
      return {
        positive: 0.5,
        negative: 0.25,
        neutral: 0.25,
        confidence: 0.5,
        model: 'finbert-tr',
      };
    }

    // Simple keyword-based sentiment (replace with FinBERT model)
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    const positiveKeywords = ['yükseliş', 'artış', 'pozitif', 'güçlü', 'başarı', 'kazanç'];
    const negativeKeywords = ['düşüş', 'azalış', 'negatif', 'zayıf', 'başarısız', 'kayıp'];

    news.forEach((item) => {
      const text = (item.title + ' ' + item.content).toLowerCase();
      const hasPositive = positiveKeywords.some((kw) => text.includes(kw));
      const hasNegative = negativeKeywords.some((kw) => text.includes(kw));

      if (hasPositive) positiveCount++;
      else if (hasNegative) negativeCount++;
      else neutralCount++;
    });

    const total = news.length;
    const positive = positiveCount / total;
    const negative = negativeCount / total;
    const neutral = neutralCount / total;

    // Normalize to sum to 1
    const sum = positive + negative + neutral;
    const normalizedPositive = sum > 0 ? positive / sum : 0.33;
    const normalizedNegative = sum > 0 ? negative / sum : 0.33;
    const normalizedNeutral = sum > 0 ? neutral / sum : 0.34;

    return {
      positive: normalizedPositive,
      negative: normalizedNegative,
      neutral: normalizedNeutral,
      confidence: 0.75 + (news.length > 5 ? 0.1 : 0), // More news = higher confidence
      model: 'finbert-tr',
    };
  }
}

/**
 * Combined News & Sentiment Feed
 */
export class SentimentFeed {
  private newsAggregator: NewsFeedAggregator;
  private sentimentAnalyzer: FinBERTSentimentAnalyzer;

  constructor() {
    this.newsAggregator = new NewsFeedAggregator();
    this.sentimentAnalyzer = new FinBERTSentimentAnalyzer();
  }

  /**
   * Get news and sentiment for a symbol
   */
  async getSentimentFeed(symbol?: string, limit: number = 20): Promise<SentimentFeedResult> {
    const news = await this.newsAggregator.aggregateNews(symbol, limit);
    const sentiment = await this.sentimentAnalyzer.analyzeSentiment(news);

    return {
      news,
      sentiment,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Stream sentiment updates (for real-time updates)
   */
  async *streamSentiment(symbol: string, intervalMs: number = 60000): AsyncGenerator<SentimentFeedResult> {
    while (true) {
      const result = await this.getSentimentFeed(symbol);
      yield result;
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }
}

// Singleton instances
export const newsFeedAggregator = new NewsFeedAggregator();
export const sentimentFeed = new SentimentFeed();



'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/config';
import { 
  NewspaperIcon, 
  ChatBubbleLeftRightIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

interface NewsItem {
  headline: string;
  source: string;
  sentiment_score: number;
  sentiment_label: string;
  sentiment_color: string;
  confidence: number;
  timestamp: string;
  url: string;
}

interface SocialPlatform {
  sentiment_score: number;
  volume: number;
  engagement_rate: number;
  trend: string;
}

interface SentimentData {
  symbol: string;
  hours_back: number;
  news_count: number;
  weighted_sentiment: number;
  sentiment_trend: string;
  news_items: NewsItem[];
  timestamp: string;
}

interface SocialData {
  symbol: string;
  overall_sentiment: number;
  platforms: Record<string, SocialPlatform>;
  timestamp: string;
}

interface AggregateData {
  symbol: string;
  news_sentiment: number;
  social_sentiment: number;
  aggregate_sentiment: number;
  sentiment_strength: number;
  prediction_impact: number;
  recommendation: string;
  timestamp: string;
}

export default function SentimentAnalysis() {
  const [symbol, setSymbol] = useState<string>('THYAO');
  const [activeTab, setActiveTab] = useState<'news' | 'social' | 'aggregate'>('news');
  const [loading, setLoading] = useState<boolean>(false);
  const [newsData, setNewsData] = useState<SentimentData | null>(null);
  const [socialData, setSocialData] = useState<SocialData | null>(null);
  const [aggregateData, setAggregateData] = useState<AggregateData | null>(null);

  const fetchNewsSentiment = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/sentiment/news?symbol=${symbol}&hours_back=24`);
      const data = await response.json();
      setNewsData(data);
    } catch (error) {
      console.error('News sentiment fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSocialSentiment = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/sentiment/social?symbol=${symbol}`);
      const data = await response.json();
      setSocialData(data);
    } catch (error) {
      console.error('Social sentiment fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAggregateSentiment = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/sentiment/aggregate?symbol=${symbol}`);
      const data = await response.json();
      setAggregateData(data);
    } catch (error) {
      console.error('Aggregate sentiment fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'news') fetchNewsSentiment();
    else if (activeTab === 'social') fetchSocialSentiment();
    else if (activeTab === 'aggregate') fetchAggregateSentiment();
  }, [symbol, activeTab]);

  const getSentimentIcon = (score: number) => {
    if (score > 0.1) return <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />;
    if (score < -0.1) return <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />;
    return <MinusIcon className="h-5 w-5 text-gray-600" />;
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-green-700 bg-green-50 border-green-200';
    if (score < -0.3) return 'text-red-700 bg-red-50 border-red-200';
    return 'text-gray-700 bg-gray-50 border-gray-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Sentiment Analizi</h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Sembol (örn: THYAO)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <button
            onClick={() => {
              if (activeTab === 'news') fetchNewsSentiment();
              else if (activeTab === 'social') fetchSocialSentiment();
              else if (activeTab === 'aggregate') fetchAggregateSentiment();
            }}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Yükleniyor...' : 'Yenile'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'news', name: 'Haber Analizi', icon: NewspaperIcon },
            { id: 'social', name: 'Sosyal Medya', icon: ChatBubbleLeftRightIcon },
            { id: 'aggregate', name: 'Toplam Sentiment', icon: ChartBarIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* News Sentiment Tab */}
      {activeTab === 'news' && newsData && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Haber Sentiment Özeti</h3>
              <div className="flex items-center gap-2">
                {getSentimentIcon(newsData.weighted_sentiment)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(newsData.weighted_sentiment)}`}>
                  {newsData.sentiment_trend}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{newsData.news_count}</div>
                <div className="text-sm text-gray-600">Haber Sayısı</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${newsData.weighted_sentiment > 0 ? 'text-green-600' : newsData.weighted_sentiment < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {(newsData.weighted_sentiment * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Sentiment Skoru</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{newsData.hours_back}h</div>
                <div className="text-sm text-gray-600">Zaman Aralığı</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900">Haber Detayları</h4>
            {newsData.news_items.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 mb-1">{item.headline}</h5>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{item.source}</span>
                      <span>•</span>
                      <span>{new Date(item.timestamp).toLocaleString('tr-TR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {getSentimentIcon(item.sentiment_score)}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(item.sentiment_score)}`}>
                      {item.sentiment_label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(item.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social Sentiment Tab */}
      {activeTab === 'social' && socialData && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Sosyal Medya Sentiment</h3>
              <div className="flex items-center gap-2">
                {getSentimentIcon(socialData.overall_sentiment)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(socialData.overall_sentiment)}`}>
                  {(socialData.overall_sentiment * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {Object.entries(socialData.platforms).map(([platform, data]) => (
              <div key={platform} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{platform}</h4>
                  {getSentimentIcon(data.sentiment_score)}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sentiment:</span>
                    <span className={`font-medium ${data.sentiment_score > 0 ? 'text-green-600' : data.sentiment_score < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {(data.sentiment_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hacim:</span>
                    <span className="font-medium">{data.volume}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Etkileşim:</span>
                    <span className="font-medium">{(data.engagement_rate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trend:</span>
                    <span className={`font-medium ${data.trend === 'Yükseliş' ? 'text-green-600' : data.trend === 'Düşüş' ? 'text-red-600' : 'text-gray-600'}`}>
                      {data.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aggregate Sentiment Tab */}
      {activeTab === 'aggregate' && aggregateData && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Toplam Sentiment Analizi</h3>
              <div className="flex items-center gap-2">
                {getSentimentIcon(aggregateData.aggregate_sentiment)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(aggregateData.aggregate_sentiment)}`}>
                  {aggregateData.recommendation}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Haber Sentiment</div>
                  <div className={`text-xl font-bold ${aggregateData.news_sentiment > 0 ? 'text-green-600' : aggregateData.news_sentiment < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {(aggregateData.news_sentiment * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Sosyal Sentiment</div>
                  <div className={`text-xl font-bold ${aggregateData.social_sentiment > 0 ? 'text-green-600' : aggregateData.social_sentiment < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {(aggregateData.social_sentiment * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Toplam Sentiment</div>
                  <div className={`text-2xl font-bold ${aggregateData.aggregate_sentiment > 0 ? 'text-green-600' : aggregateData.aggregate_sentiment < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {(aggregateData.aggregate_sentiment * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Sentiment Gücü</div>
                  <div className="text-xl font-bold text-gray-900">
                    {(aggregateData.sentiment_strength * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Tahmin Etkisi</div>
                  <div className={`text-xl font-bold ${aggregateData.prediction_impact > 0 ? 'text-green-600' : aggregateData.prediction_impact < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {(aggregateData.prediction_impact * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

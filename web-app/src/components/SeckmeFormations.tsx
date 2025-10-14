'use client';

import { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface SeckmeFormation {
  id: string;
  symbol: string;
  formation: 'Seçmeki Yükseliş' | 'Seçmeki Düşüş' | 'Seçmeki Konsolidasyon' | 'Seçmeki Kırılım';
  type: 'bullish' | 'bearish' | 'neutral' | 'breakout';
  confidence: number;
  price: number;
  target: number;
  stopLoss: number;
  timeframe: string;
  volume: number;
  strength: 'Zayıf' | 'Orta' | 'Güçlü' | 'Çok Güçlü';
  description: string;
  pattern: {
    points: Array<{x: number, y: number, label: string}>;
    trendlines: Array<{start: {x: number, y: number}, end: {x: number, y: number}, type: string}>;
  };
  timestamp: string;
}

interface SeckmeFormationsProps {
  isLoading?: boolean;
}

export default function SeckmeFormations({ isLoading }: SeckmeFormationsProps) {
  const [formations, setFormations] = useState<SeckmeFormation[]>([]);
  const [selectedFormation, setSelectedFormation] = useState<SeckmeFormation | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState<'all' | 'bullish' | 'bearish' | 'breakout'>('all');

  useEffect(() => {
    // Mock Seçmeki formasyonları
    const mockFormations: SeckmeFormation[] = [
      {
        id: '1',
        symbol: 'THYAO',
        formation: 'Seçmeki Yükseliş',
        type: 'bullish',
        confidence: 0.92,
        price: 325.50,
        target: 345.80,
        stopLoss: 315.20,
        timeframe: '4H',
        volume: 2500000,
        strength: 'Çok Güçlü',
        description: 'Üçlü dip formasyonu ile güçlü yükseliş sinyali. Hacim artışı ile destekleniyor.',
        pattern: {
          points: [
            { x: 0, y: 320, label: 'Dip 1' },
            { x: 1, y: 315, label: 'Dip 2' },
            { x: 2, y: 318, label: 'Dip 3' },
            { x: 3, y: 325, label: 'Kırılım' }
          ],
          trendlines: [
            { start: { x: 0, y: 320 }, end: { x: 2, y: 318 }, type: 'support' },
            { start: { x: 1, y: 315 }, end: { x: 3, y: 325 }, type: 'resistance' }
          ]
        },
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        symbol: 'ASELS',
        formation: 'Seçmeki Düşüş',
        type: 'bearish',
        confidence: 0.88,
        price: 88.40,
        target: 82.15,
        stopLoss: 92.80,
        timeframe: '1D',
        volume: 1800000,
        strength: 'Güçlü',
        description: 'Çifte tepe formasyonu ile düşüş sinyali. RSI overbought seviyede.',
        pattern: {
          points: [
            { x: 0, y: 90, label: 'Tepe 1' },
            { x: 1, y: 88, label: 'Vadi' },
            { x: 2, y: 91, label: 'Tepe 2' },
            { x: 3, y: 88, label: 'Kırılım' }
          ],
          trendlines: [
            { start: { x: 0, y: 90 }, end: { x: 2, y: 91 }, type: 'resistance' },
            { start: { x: 1, y: 88 }, end: { x: 3, y: 88 }, type: 'support' }
          ]
        },
        timestamp: new Date().toISOString()
      },
      {
        id: '3',
        symbol: 'TUPRS',
        formation: 'Seçmeki Kırılım',
        type: 'breakout',
        confidence: 0.95,
        price: 145.20,
        target: 158.50,
        stopLoss: 140.80,
        timeframe: '2H',
        volume: 3200000,
        strength: 'Çok Güçlü',
        description: 'Üçgen formasyonu kırılımı. Yüksek hacim ile destekleniyor.',
        pattern: {
          points: [
            { x: 0, y: 142, label: 'Destek' },
            { x: 1, y: 144, label: 'Direnç' },
            { x: 2, y: 143, label: 'Destek' },
            { x: 3, y: 145, label: 'Kırılım' }
          ],
          trendlines: [
            { start: { x: 0, y: 142 }, end: { x: 2, y: 143 }, type: 'support' },
            { start: { x: 1, y: 144 }, end: { x: 3, y: 145 }, type: 'resistance' }
          ]
        },
        timestamp: new Date().toISOString()
      },
      {
        id: '4',
        symbol: 'SISE',
        formation: 'Seçmeki Konsolidasyon',
        type: 'neutral',
        confidence: 0.75,
        price: 45.80,
        target: 48.20,
        stopLoss: 44.10,
        timeframe: '1H',
        volume: 950000,
        strength: 'Orta',
        description: 'Yatay konsolidasyon. Kırılım yönü belirsiz.',
        pattern: {
          points: [
            { x: 0, y: 45, label: 'Alt' },
            { x: 1, y: 46, label: 'Üst' },
            { x: 2, y: 45.5, label: 'Alt' },
            { x: 3, y: 45.8, label: 'Mevcut' }
          ],
          trendlines: [
            { start: { x: 0, y: 45 }, end: { x: 2, y: 45.5 }, type: 'support' },
            { start: { x: 1, y: 46 }, end: { x: 3, y: 45.8 }, type: 'resistance' }
          ]
        },
        timestamp: new Date().toISOString()
      }
    ];

    setTimeout(() => {
      setFormations(mockFormations);
    }, 1000);
  }, []);

  const getFormationColor = (type: string) => {
    switch (type) {
      case 'bullish': return 'text-green-600 bg-green-100';
      case 'bearish': return 'text-red-600 bg-red-100';
      case 'breakout': return 'text-blue-600 bg-blue-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Çok Güçlü': return 'text-green-600';
      case 'Güçlü': return 'text-blue-600';
      case 'Orta': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getFormationIcon = (type: string) => {
    switch (type) {
      case 'bullish': return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
      case 'bearish': return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
      case 'breakout': return <ChartBarIcon className="h-5 w-5 text-blue-500" />;
      default: return <ChartBarIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const filteredFormations = filter === 'all' 
    ? formations 
    : formations.filter(f => f.type === filter);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Seçmeki Formasyonları</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-300 rounded"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">Seçmeki Formasyonları</h2>
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
              Özel
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              <option value="all">Tüm Formasyonlar</option>
              <option value="bullish">Yükseliş</option>
              <option value="bearish">Düşüş</option>
              <option value="breakout">Kırılım</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {filteredFormations.map((formation) => (
            <div key={formation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getFormationIcon(formation.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-gray-900">{formation.symbol}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFormationColor(formation.type)}`}>
                        {formation.formation}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{formation.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">Zaman: {formation.timeframe}</span>
                      <span className={`text-xs font-medium ${getStrengthColor(formation.strength)}`}>
                        Güç: {formation.strength}
                      </span>
                      <span className="text-xs text-gray-500">
                        Hacim: {formation.volume.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₺{formation.price.toFixed(2)}</p>
                  <p className="text-sm text-green-600">
                    Hedef: ₺{formation.target.toFixed(2)}
                  </p>
                  <p className="text-sm text-red-600">
                    Stop: ₺{formation.stopLoss.toFixed(2)}
                  </p>
                  <p className="text-sm text-blue-600 font-medium">
                    Güven: {(formation.confidence * 100).toFixed(0)}%
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedFormation(formation);
                      setShowDetails(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Detayları Görüntüle"
                  >
                    <InformationCircleIcon className="h-5 w-5" />
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                    Takip Et
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formation Details Modal */}
      {showDetails && selectedFormation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedFormation.symbol} - {selectedFormation.formation}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Formation Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mevcut Fiyat</p>
                  <p className="text-lg font-semibold text-gray-900">₺{selectedFormation.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hedef Fiyat</p>
                  <p className="text-lg font-semibold text-green-600">₺{selectedFormation.target.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Stop Loss</p>
                  <p className="text-lg font-semibold text-red-600">₺{selectedFormation.stopLoss.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Güven Oranı</p>
                  <p className="text-lg font-semibold text-blue-600">{(selectedFormation.confidence * 100).toFixed(0)}%</p>
                </div>
              </div>

              {/* Pattern Visualization */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Formasyon Deseni</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="h-48 bg-white border rounded relative">
                    {/* Simple pattern visualization */}
                    <svg className="w-full h-full" viewBox="0 0 400 200">
                      {selectedFormation.pattern.points.map((point, index) => (
                        <g key={index}>
                          <circle 
                            cx={point.x * 100 + 50} 
                            cy={200 - (point.y - 40) * 4} 
                            r="4" 
                            fill={selectedFormation.type === 'bullish' ? '#10B981' : 
                                  selectedFormation.type === 'bearish' ? '#EF4444' : '#3B82F6'}
                          />
                          <text 
                            x={point.x * 100 + 50} 
                            y={200 - (point.y - 40) * 4 - 10} 
                            textAnchor="middle" 
                            className="text-xs fill-gray-600"
                          >
                            {point.label}
                          </text>
                        </g>
                      ))}
                      {selectedFormation.pattern.trendlines.map((line, index) => (
                        <line
                          key={index}
                          x1={line.start.x * 100 + 50}
                          y1={200 - (line.start.y - 40) * 4}
                          x2={line.end.x * 100 + 50}
                          y2={200 - (line.end.y - 40) * 4}
                          stroke={line.type === 'support' ? '#10B981' : '#EF4444'}
                          strokeWidth="2"
                          strokeDasharray={line.type === 'support' ? '5,5' : 'none'}
                        />
                      ))}
                    </svg>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-2">Açıklama</h4>
                <p className="text-sm text-gray-700">{selectedFormation.description}</p>
              </div>

              {/* Risk Analysis */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Risk Analizi</p>
                    <p className="text-sm text-yellow-700">
                      Bu formasyon {selectedFormation.strength.toLowerCase()} güçte. 
                      Stop loss seviyesini aşmamaya dikkat edin.
                    </p>
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

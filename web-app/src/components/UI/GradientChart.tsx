"use client";
import React from 'react';

interface ChartData {
  time: string;
  price: number;
  volume?: number;
  rsi?: number;
  macd?: number;
}

interface GradientChartProps {
  data: ChartData[];
  symbol?: string;
  height?: number;
  showVolume?: boolean;
  showIndicators?: boolean;
}

export function GradientChart({ 
  data, 
  symbol = 'THYAO',
  height = 300,
  showVolume = false,
  showIndicators = true
}: GradientChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-surface/50 p-6 rounded-2xl border border-white/10 backdrop-blur-glass shadow-glow-smart">
        <div className="text-center text-text/60">
          <p>Grafik verisi yükleniyor...</p>
        </div>
      </div>
    );
  }

  const maxPrice = Math.max(...data.map(d => d.price));
  const minPrice = Math.min(...data.map(d => d.price));
  const priceRange = maxPrice - minPrice;

  return (
    <div className="bg-surface/50 p-6 rounded-2xl border border-white/10 backdrop-blur-glass shadow-glow-smart">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-accent mb-2">
          {symbol} - Fiyat Grafiği
        </h3>
        <div className="flex gap-4 text-sm text-text/70">
          <span>Maksimum: ₺{maxPrice.toFixed(2)}</span>
          <span>Minimum: ₺{minPrice.toFixed(2)}</span>
          <span>Değişim: ₺{(maxPrice - minPrice).toFixed(2)}</span>
        </div>
      </div>

      <div className="relative" style={{ height: `${height}px` }}>
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Grid lines */}
          <defs>
            <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00E0FF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00E0FF" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00FF9D" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#00FF9D" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <g key={i}>
              <line
                x1="0"
                y1={height * ratio}
                x2="100%"
                y2={height * ratio}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
              <text
                x="5"
                y={height * ratio + 4}
                fill="rgba(255,255,255,0.5)"
                fontSize="10"
              >
                ₺{(maxPrice - priceRange * ratio).toFixed(0)}
              </text>
            </g>
          ))}

          {/* Price line */}
          <polyline
            fill="none"
            stroke="#00E0FF"
            strokeWidth="2"
            points={data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = height - ((d.price - minPrice) / priceRange) * height;
              return `${x},${y}`;
            }).join(' ')}
          />

          {/* Price area fill */}
          <polygon
            fill="url(#priceGradient)"
            points={[
              `0,${height}`,
              ...data.map((d, i) => {
                const x = (i / (data.length - 1)) * 100;
                const y = height - ((d.price - minPrice) / priceRange) * height;
                return `${x},${y}`;
              }),
              `100,${height}`
            ].join(' ')}
          />

          {/* Data points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = height - ((d.price - minPrice) / priceRange) * height;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill="#00E0FF"
                className="hover:r-4 transition-all cursor-pointer"
              />
            );
          })}

          {/* Volume bars */}
          {showVolume && data[0]?.volume && (
            <g opacity="0.3">
              {data.map((d, i) => {
                const x = (i / (data.length - 1)) * 100;
                const barHeight = (d.volume! / Math.max(...data.map(d => d.volume || 0))) * height * 0.3;
                return (
                  <rect
                    key={i}
                    x={x - 1}
                    y={height - barHeight}
                    width="2"
                    height={barHeight}
                    fill="url(#volumeGradient)"
                  />
                );
              })}
            </g>
          )}
        </svg>

        {/* Indicators */}
        {showIndicators && (
          <div className="absolute top-4 right-4 bg-surface/80 backdrop-blur-glass rounded-lg p-3 border border-white/10">
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-text/70">Fiyat</span>
              </div>
              {showVolume && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-text/70">Hacim</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GradientChart;


import React from 'react';
import { clsx } from 'clsx';

interface AIInsightPanelProps {
  className?: string;
}

const AIInsightPanel: React.FC<AIInsightPanelProps> = ({ className }) => {
  const insights = [
    {
      title: "Market Regime Analysis",
      content: "Risk-On modunda, teknoloji sektörü güçlü momentum gösteriyor",
      confidence: 87,
      type: "regime"
    },
    {
      title: "AI Signal Confluence",
      content: "THYAO için 3 farklı model BUY sinyali veriyor. Teknik analiz destekliyor",
      confidence: 92,
      type: "signal"
    },
    {
      title: "Sentiment Analysis",
      content: "Son haberler pozitif, sosyal medya sentiment skoru %78",
      confidence: 78,
      type: "sentiment"
    }
  ];

  return (
    <div className={clsx('space-y-4', className)}>
      <div className="flex items-center space-x-2 mb-6">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#00FFC6] to-[#00A8FF] flex items-center justify-center">
          <span className="text-sm font-bold text-white">AI</span>
        </div>
        <h2 className="text-xl font-semibold text-white">AI Insights</h2>
        <div className="h-2 w-2 rounded-full bg-[#00FFC6] animate-pulse"></div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div 
            key={index}
            className="bg-[rgba(25,25,25,0.65)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] rounded-xl p-4 hover:border-[rgba(0,224,255,0.3)] transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#00FFC6]">{insight.title}</h3>
              <div className="flex items-center space-x-2">
                <div className="text-xs text-gray-400">{insight.confidence}%</div>
                <div className="h-2 w-2 rounded-full bg-[#00FFC6] animate-pulse"></div>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              {insight.content}
            </p>
            
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-[#00FFC6] to-[#00A8FF] h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${insight.confidence}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-400">{insight.type}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-[rgba(0,224,255,0.05)] border border-[rgba(0,224,255,0.2)] rounded-xl">
        <div className="flex items-center space-x-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-[#00FFC6] animate-pulse"></div>
          <span className="text-sm font-semibold text-[#00FFC6]">Live AI Analysis</span>
        </div>
        <p className="text-gray-300 text-sm">
          Sistem şu anda 15 farklı hisse senedini analiz ediyor. 
          En güçlü sinyal THYAO için %92 güvenle BUY önerisi.
        </p>
      </div>
    </div>
  );
};

export default AIInsightPanel;
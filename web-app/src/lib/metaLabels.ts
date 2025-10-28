/**
 * Meta Labels for charts, tooltips, and UI elements
 * Provides consistent meta information (methods, periods, scales)
 */

/**
 * Chart legend labels
 */
export const CHART_LEGEND = {
  actualPrice: 'Gerçek Fiyat',
  predictedPrice: 'AI Tahmini',
  portfolioValue: 'Portföy Değeri',
  confidence: 'Güven Seviyesi'
};

/**
 * Tooltip metadata
 */
export function getTooltipMeta(type: 'correlation' | 'risk' | 'backtest' | 'confidence') {
  switch (type) {
    case 'correlation':
      return {
        title: 'Korelasyon Katsayısı',
        method: 'Pearson Korelasyon',
        period: '90 gün',
        dataType: 'Günlük kapanış',
        tooltip: 'Pearson korelasyon katsayısı (-1 ile +1 arası). Pozitif değerler iki hissenin birlikte hareket ettiğini, negatif değerler tersine hareket ettiğini gösterir.'
      };
    case 'risk':
      return {
        title: 'Risk Skoru',
        scale: '1-5',
        tooltip: 'Risk skoru, volatilite, likidite ve piyasa koşullarına dayalı hesaplanır. 1=Çok Düşük, 5=Çok Yüksek.'
      };
    case 'backtest':
      return {
        title: 'Backtest Sonuçları',
        period: '30 gün',
        assumptions: 'Fee: %0.15, Slippage: %0.10',
        tooltip: 'Backtest, geçmiş veriler üzerinde AI sinyallerinin performansını gösterir. Gerçek kazançları garanti etmez.'
      };
    case 'confidence':
      return {
        title: 'AI Güven Göstergesi',
        scale: '0-100%',
        interpretation: 'Model Confidence (calibrated)',
        tooltip: 'Kalibre edilmiş güven skoru. Yüksek değer, kararda tutarlılığı ifade eder.'
      };
    default:
      return { title: '', tooltip: '' };
  }
}

/**
 * AI confidence calibration info
 */
export function getConfidenceCalibration() {
  return {
    method: 'Calibrated Confidence',
    range: '0-100%',
    interpretation: 'Bu sinyalin güvenilirliği AI modelinin kalibre edilmiş güven skorudur. Daha yüksek değer, kararda tutarlılığı ifade eder.',
    factors: ['Model Accuracy', 'Historic Performance', 'Market Conditions', 'Technical Indicators']
  };
}


/**
 * P5.2: Behavioral Risk Adaptation
 * AI, kullanıcı davranışını (agresif/pasif seçim) gerçekten değiştirmiyor → Davranış tabanlı fonksiyon
 */

export interface UserProfile {
  riskMode: 'aggressive' | 'passive' | 'balanced';
  tradeStyle: 'scalper' | 'swing' | 'position';
  maxPositionSize: number; // 0-1 scale
  stopLossTightness: number; // 0-1 scale (0 = tight, 1 = loose)
}

export interface AdjustedSignal {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  originalConfidence: number;
  adjustedConfidence: number;
  positionSize: number; // 0-1 scale
  stopLoss: number; // Percentage
  takeProfit: number; // Percentage
  tradeFrequency: number; // Multiplier (1.0 = normal, 1.5 = 50% more frequent)
}

/**
 * Behavioral Risk Adaptation Engine
 */
export class BehavioralRiskAdapter {
  /**
   * Adjust trading signal based on user profile
   */
  adjustSignal(
    symbol: string,
    signal: 'BUY' | 'SELL' | 'HOLD',
    confidence: number,
    userProfile: UserProfile
  ): AdjustedSignal {
    const { riskMode, tradeStyle, maxPositionSize, stopLossTightness } = userProfile;

    // Adjust confidence based on risk mode
    let adjustedConfidence = confidence;
    let positionSize = maxPositionSize;
    let stopLoss = 0.03; // Default 3%
    let takeProfit = 0.05; // Default 5%
    let tradeFrequency = 1.0;

    // Aggressive mode adjustments
    if (riskMode === 'aggressive') {
      // Increase position size
      positionSize = Math.min(1.0, maxPositionSize * 1.5);
      
      // Wider stop loss
      stopLoss = 0.05 * (1 - stopLossTightness) + 0.02 * stopLossTightness;
      takeProfit = 0.08 * (1 - stopLossTightness) + 0.05 * stopLossTightness;
      
      // More frequent trading
      tradeFrequency = 1.5;
      
      // Boost confidence for aggressive traders
      if (confidence >= 0.65) {
        adjustedConfidence = Math.min(1.0, confidence * 1.1);
      }
    }
    
    // Passive mode adjustments
    else if (riskMode === 'passive') {
      // Reduce position size
      positionSize = maxPositionSize * 0.7;
      
      // Tighter stop loss
      stopLoss = 0.02 * stopLossTightness + 0.015 * (1 - stopLossTightness);
      takeProfit = 0.04 * stopLossTightness + 0.03 * (1 - stopLossTightness);
      
      // Less frequent trading
      tradeFrequency = 0.7;
      
      // Require higher confidence
      if (confidence < 0.75) {
        // Downgrade signal to HOLD if confidence too low
        if (signal !== 'HOLD') {
          return this.adjustSignal(symbol, 'HOLD', confidence, userProfile);
        }
      } else {
        adjustedConfidence = confidence * 0.95; // Slightly conservative
      }
    }

    // Balanced mode (default)
    else {
      // No adjustments, use defaults
      positionSize = maxPositionSize;
      stopLoss = 0.03;
      takeProfit = 0.05;
      tradeFrequency = 1.0;
    }

    // Adjust based on trade style
    if (tradeStyle === 'scalper') {
      // Tighter stops, smaller targets
      stopLoss = stopLoss * 0.7;
      takeProfit = takeProfit * 0.8;
      tradeFrequency = tradeFrequency * 1.3;
    } else if (tradeStyle === 'position') {
      // Wider stops, larger targets
      stopLoss = stopLoss * 1.5;
      takeProfit = takeProfit * 1.5;
      tradeFrequency = tradeFrequency * 0.6;
    }

    return {
      symbol,
      signal,
      originalConfidence: confidence,
      adjustedConfidence,
      positionSize,
      stopLoss,
      takeProfit,
      tradeFrequency,
    };
  }

  /**
   * Get user profile from localStorage or defaults
   */
  getUserProfile(): UserProfile {
    if (typeof window === 'undefined') {
      return this.getDefaultProfile();
    }

    try {
      const stored = localStorage.getItem('user_profile');
      if (stored) {
        const profile = JSON.parse(stored);
        return {
          riskMode: profile.riskMode || 'balanced',
          tradeStyle: profile.tradeStyle || 'swing',
          maxPositionSize: profile.maxPositionSize ?? 0.2,
          stopLossTightness: profile.stopLossTightness ?? 0.5,
        };
      }
    } catch (error) {
      console.warn('⚠️ Failed to load user profile:', error);
    }

    return this.getDefaultProfile();
  }

  /**
   * Save user profile to localStorage
   */
  saveUserProfile(profile: UserProfile): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('user_profile', JSON.stringify(profile));
    } catch (error) {
      console.warn('⚠️ Failed to save user profile:', error);
    }
  }

  /**
   * Get default profile
   */
  private getDefaultProfile(): UserProfile {
    return {
      riskMode: 'balanced',
      tradeStyle: 'swing',
      maxPositionSize: 0.2, // 20% of portfolio
      stopLossTightness: 0.5, // Medium tightness
    };
  }
}

// Singleton instance
export const behavioralRiskAdapter = new BehavioralRiskAdapter();

/**
 * Adjust signal based on user behavior
 */
export function adjustSignalForUser(
  symbol: string,
  signal: 'BUY' | 'SELL' | 'HOLD',
  confidence: number,
  userProfile?: UserProfile
): AdjustedSignal {
  const profile = userProfile || behavioralRiskAdapter.getUserProfile();
  return behavioralRiskAdapter.adjustSignal(symbol, signal, confidence, profile);
}



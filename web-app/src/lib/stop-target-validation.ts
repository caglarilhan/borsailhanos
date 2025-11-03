/**
 * P1-M1: Stop/Target Validation
 * BUY için stop < price < target, SELL için target < price < stop kuralını UI render'da assert et
 */

export type SignalSide = 'BUY' | 'SELL' | 'HOLD';

export interface StopTargetValidation {
  isValid: boolean;
  violation?: 'stop_price' | 'target_price' | 'stop_target';
  message?: string;
  warning?: boolean; // Yellow warning badge
}

/**
 * Validate stop/target relationship for BUY signal
 * Rule: stop < price < target
 */
export function validateBuyStopTarget(
  price: number,
  stop: number | null | undefined,
  target: number | null | undefined
): StopTargetValidation {
  if (!stop || !target) {
    return {
      isValid: true, // No validation if missing
    };
  }
  
  if (stop >= price) {
    return {
      isValid: false,
      violation: 'stop_price',
      message: `Stop loss (${stop}) should be below price (${price}) for BUY signal`,
      warning: true,
    };
  }
  
  if (target <= price) {
    return {
      isValid: false,
      violation: 'target_price',
      message: `Target (${target}) should be above price (${price}) for BUY signal`,
      warning: true,
    };
  }
  
  if (stop >= target) {
    return {
      isValid: false,
      violation: 'stop_target',
      message: `Stop loss (${stop}) should be below target (${target}) for BUY signal`,
      warning: true,
    };
  }
  
  return {
    isValid: true,
  };
}

/**
 * Validate stop/target relationship for SELL signal
 * Rule: target < price < stop
 */
export function validateSellStopTarget(
  price: number,
  stop: number | null | undefined,
  target: number | null | undefined
): StopTargetValidation {
  if (!stop || !target) {
    return {
      isValid: true, // No validation if missing
    };
  }
  
  if (target >= price) {
    return {
      isValid: false,
      violation: 'target_price',
      message: `Target (${target}) should be below price (${price}) for SELL signal`,
      warning: true,
    };
  }
  
  if (stop <= price) {
    return {
      isValid: false,
      violation: 'stop_price',
      message: `Stop loss (${stop}) should be above price (${price}) for SELL signal`,
      warning: true,
    };
  }
  
  if (target >= stop) {
    return {
      isValid: false,
      violation: 'stop_target',
      message: `Target (${target}) should be below stop loss (${stop}) for SELL signal`,
      warning: true,
    };
  }
  
  return {
    isValid: true,
  };
}

/**
 * Validate stop/target for any signal type
 */
export function validateStopTarget(
  side: SignalSide,
  price: number,
  stop: number | null | undefined,
  target: number | null | undefined
): StopTargetValidation {
  if (side === 'BUY') {
    return validateBuyStopTarget(price, stop, target);
  } else if (side === 'SELL') {
    return validateSellStopTarget(price, stop, target);
  }
  
  // HOLD: no validation
  return {
    isValid: true,
  };
}



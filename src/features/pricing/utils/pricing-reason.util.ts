export function getReason(
  daysLeft: number,
  stockRatio: number,
  soldRatio: number,
  increaseThreshold: number,
  decreaseThreshold: number,
  initial: number,
  final: number,
): string {
  if (final > initial) {
    return 'Stock increased during period (restock or capacity increase)';
  }
  if (daysLeft <= 7) {
    if (stockRatio <= 0.1) {
      return `Very high demand: only ${Math.round(stockRatio * 100)}% stock left with ${daysLeft} days to go`;
    } else if (stockRatio > 0.3) {
      return `Low demand: still ${Math.round(stockRatio * 100)}% stock left with only ${daysLeft} days to go`;
    }
    return 'Normal demand';
  } else {
    if (soldRatio >= increaseThreshold) {
      return `High demand: ${Math.round(soldRatio * 100)}% sold in period`;
    } else if (soldRatio <= decreaseThreshold && initial > 0) {
      return `Low demand: only ${Math.round(soldRatio * 100)}% sold in period`;
    }
    return 'Normal demand';
  }
}

/**
 * Returns a human-readable reason for the pricing suggestion based on stock and demand.
 *
 * @param daysLeft - Number of days left until the event or timeslot
 * @param stockRatio - Remaining stock ratio (0 to 1)
 * @param soldRatio - Sold ratio during the period (0 to 1)
 * @param increaseThreshold - Threshold to consider demand as high
 * @param decreaseThreshold - Threshold to consider demand as low
 * @param initial - Initial stock at the start of the period
 * @param final - Final stock at the end of the period
 * @returns A string describing the demand or stock situation
 */
export function getReason(
  daysLeft: number,
  stockRatio: number,
  soldRatio: number,
  increaseThreshold: number,
  decreaseThreshold: number,
  initial: number,
  final: number,
): string {
  // If stock increased, likely due to restocking or capacity increase
  if (final > initial) {
    return 'Stock increased during period (restock or capacity increase)';
  }
  // If the event is within 7 days, focus on remaining stock
  if (daysLeft <= 7) {
    if (stockRatio <= 0.1) {
      return `Very high demand: only ${Math.round(stockRatio * 100)}% stock left with ${daysLeft} days to go`;
    } else if (stockRatio > 0.3) {
      return `Low demand: still ${Math.round(stockRatio * 100)}% stock left with only ${daysLeft} days to go`;
    }
    return 'Normal demand';
  } else {
    // For longer periods, focus on sold ratio
    if (soldRatio >= increaseThreshold) {
      return `High demand: ${Math.round(soldRatio * 100)}% sold in period`;
    } else if (soldRatio <= decreaseThreshold && initial > 0) {
      return `Low demand: only ${Math.round(soldRatio * 100)}% sold in period`;
    }
    return 'Normal demand';
  }
}

export interface TimeslotPricingSuggestion {
  time: string;
  initialQuantity: number;
  finalQuantity: number;
  sold: number;
  suggestPriceIncrease: boolean;
  reason: string;
}

export interface PricingSuggestionResult {
  activityId: string;
  startDate: string;
  endDate: string;
  timeslots: TimeslotPricingSuggestion[];
}

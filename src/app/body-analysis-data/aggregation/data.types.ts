export type WidgetValues = {
  selectedDateRangeFrom: Date | null;
  selectedDateRangeTo: Date | null;
  latestValue: number | null;
  lossGainInSelectedDateRange: number | null;
  averageWeeklyLossGain: number | null;
};

export type BodyAnalysisWeekly = {
  firstDayOfWeek: Date;
  weightDiff: number;
};

import { differenceInCalendarDays, isMonday, startOfDay } from 'date-fns';
import { BodyAnalysis, BodyAnalysisProperty } from '../body-analysis.types';
import { BodyAnalysisWeekly, WidgetValues } from './data.types';

export const nullWidgetValues = {
  selectedDateRangeFrom: null,
  selectedDateRangeTo: null,
  latestValue: null,
  lossGainInSelectedDateRange: null,
  averageWeeklyLossGain: null,
};

export function calculateWidgetValues(
  bodyAnalysisData: BodyAnalysis[],
  property: BodyAnalysisProperty
): WidgetValues {
  if (bodyAnalysisData.length === 0) return nullWidgetValues;

  return {
    selectedDateRangeFrom: bodyAnalysisData[0].analysedAt,
    selectedDateRangeTo:
      bodyAnalysisData[bodyAnalysisData.length - 1].analysedAt,
    latestValue: bodyAnalysisData[bodyAnalysisData.length - 1][property],
    lossGainInSelectedDateRange:
      bodyAnalysisData[bodyAnalysisData.length - 1][property] -
      bodyAnalysisData[0][property],
    averageWeeklyLossGain: calculateAverageWeeklyLossGain(
      bodyAnalysisData,
      property
    ),
  };
}

function calculateAverageWeeklyLossGain(
  bodyAnalysisData: BodyAnalysis[],
  property: BodyAnalysisProperty
): number | null {
  if (bodyAnalysisData.length < 2) return null;

  const first = bodyAnalysisData.at(0)!;
  const last = bodyAnalysisData.at(-1)!;

  const timespanInDays = differenceInCalendarDays(
    first.analysedAt,
    last.analysedAt
  );

  const differencesBetweenDays = bodyAnalysisData
    .slice(1)
    .map((x, i) => x[property] - bodyAnalysisData[i][property]);

  const sumOfDifferences = differencesBetweenDays.reduce(
    (acc, next) => acc + next,
    0
  );

  return Math.abs(sumOfDifferences / (timespanInDays / 7.0));
}

export function calculateWeekDifferences(
  data: BodyAnalysis[]
): BodyAnalysisWeekly[] {
  const mondays = data.filter((x) => isMonday(x.analysedAt));

  if (mondays.length < 2) return [];

  const firstMondaySkipped = mondays.slice(1);

  const weightDiff: BodyAnalysisWeekly[] = firstMondaySkipped.map((x, i) => ({
    firstDayOfWeek: startOfDay(mondays[i].analysedAt),
    weightDiff: x.weight - mondays[i].weight,
  }));

  return weightDiff;
}

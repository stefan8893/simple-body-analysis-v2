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

  const onlyMondays = bodyAnalysisData.filter((x) => isMonday(x.analysedAt));

  const firstEntry = bodyAnalysisData.at(0);
  const isFirstEntryMonday = isMonday(firstEntry!.analysedAt);
  const lastEntry = bodyAnalysisData.at(-1);
  const isLastEntryMonday = isMonday(lastEntry!.analysedAt);

  const proportionOfFirstNotFullWeek = isFirstEntryMonday
    ? 0
    : differenceInCalendarDays(
        firstEntry!.analysedAt,
        onlyMondays.at(0)?.analysedAt ?? lastEntry!.analysedAt
      ) / 7;

  const proportionOfLastNotFullWeek = isLastEntryMonday
    ? 0
    : differenceInCalendarDays(
        onlyMondays.at(-1)?.analysedAt ?? firstEntry!.analysedAt,
        lastEntry!.analysedAt
      ) / 7;

  const startOfWeeks: BodyAnalysis[] = [
    ...(isFirstEntryMonday ? [] : [firstEntry!]),
    ...onlyMondays,
    ...(isLastEntryMonday ? [] : [lastEntry!]),
  ];

  const diff = startOfWeeks
    .slice(1)
    .map((x, i) => startOfWeeks[i][property] - x[property]);

  const sumOfDifferences = diff.reduce((acc, next) => acc + next, 0);

  const weeks =
    (diff.length === 1 ? 0 : diff.length) +
    proportionOfFirstNotFullWeek +
    proportionOfLastNotFullWeek;

  return Math.abs(sumOfDifferences / weeks);
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

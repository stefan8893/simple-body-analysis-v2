import {
  addDays,
  endOfDay,
  endOfYear,
  startOfDay,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';

export type QuickSelection = {
  name: string;
  code: string;
  range: () => Date[];
};

export const availableQuickSelections: QuickSelection[] = [
  {
    name: 'Letzte 7 Tage',
    code: 'L7D',
    range: () => {
      const from = startOfDay(subDays(new Date(), 6));
      const to = endOfDay(new Date());

      return [from, to];
    },
  },
  {
    name: 'Letzte 14 Tage',
    code: 'L14D',
    range: () => {
      const from = startOfDay(subDays(new Date(), 13));
      const to = endOfDay(new Date());

      return [from, to];
    },
  },
  {
    name: 'Letzte 30 Tage',
    code: 'L30D',
    range: () => {
      const from = startOfDay(subDays(new Date(), 29));
      const to = endOfDay(new Date());

      return [from, to];
    },
  },
  {
    name: 'Letzte 2 Monate',
    code: 'L2M',
    range: () => {
      const from = startOfDay(subMonths(addDays(new Date(), 1), 2));
      const to = endOfDay(new Date());

      return [from, to];
    },
  },
  {
    name: 'Letzte 3 Monate',
    code: 'L3M',
    range: () => {
      const from = startOfDay(subMonths(addDays(new Date(), 1), 3));
      const to = endOfDay(new Date());

      return [from, to];
    },
  },
  {
    name: 'Letzte 6 Monate',
    code: 'L6M',
    range: () => {
      const from = startOfDay(subMonths(addDays(new Date(), 1), 6));
      const to = endOfDay(new Date());

      return [from, to];
    },
  },
  {
    name: 'Akutelles Jahr',
    code: 'CY',
    range: () => {
      const from = startOfYear(new Date());
      const to = endOfDay(new Date());

      return [from, to];
    },
  },
  {
    name: 'Letztes Jahr',
    code: 'LY',
    range: () => {
      const from = startOfDay(subYears(addDays(new Date(), 1), 1));
      const to = endOfDay(new Date());

      return [from, to];
    },
  },
  {
    name: 'Vorheriges Jahr',
    code: 'PY',
    range: () => {
      const oneYearAgo = subYears(new Date(), 1);
      const from = startOfYear(oneYearAgo);
      const to = endOfYear(oneYearAgo);

      return [from, to];
    },
  },
  {
    name: 'Letzte 2 Jahre',
    code: ' ',
    range: () => {
      const from = subYears(addDays(new Date(), 1), 2);
      const to = endOfDay(new Date());

      return [from, to];
    },
  },
];

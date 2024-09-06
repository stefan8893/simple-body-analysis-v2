import { Context } from 'chartjs-plugin-datalabels';
import { layouVariables } from '../../styles/layout-variables';
import { Unit } from '../infrastructure/units';

type TShirtSize = 'Small' | 'Medium' | 'Large' | 'XLarge';

export function getDataSize(ctx: Context): TShirtSize {
  const length = ctx.dataset.data.length;

  if (length <= 14) return 'Small';
  else if (length <= 30) return 'Medium';
  else if (length <= 60) return 'Large';
  else return 'XLarge';
}

export function showDataPoint(ctx: Context): boolean {
  if (ctx.chart.width <= layouVariables.mobileBreakpoint.value) return false;

  const tShirtSize = getDataSize(ctx);

  const showLabelEveryNthPoint = () => {
    if (tShirtSize === 'Small') return 1;
    if (tShirtSize === 'Medium') return 3;
    if (tShirtSize === 'Large') return 7;
    return 20;
  };

  if (ctx.dataIndex === ctx.dataset.data.length - 1) return true;

  return ctx.dataIndex % showLabelEveryNthPoint() === 0;
}

const unitOfMeasureByDatasetLabel = new Map<string, Unit>([
  ['Gewicht', 'kg'],
  ['Muskeln', '%'],
  ['Wasser', '%'],
  ['Fett', '%'],
  ['Bmi', ''],
  ['Täglicher Kalorienbedarf', 'kcal'],
]);

export function getUnitOfMeasureOrDefault(label: string | undefined): string {
  return unitOfMeasureByDatasetLabel.has(label ?? '')
    ? unitOfMeasureByDatasetLabel.get(label ?? '')!
    : '';
}

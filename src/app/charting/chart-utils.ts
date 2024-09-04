import { Context } from 'chartjs-plugin-datalabels';
import { layouVariables } from '../../styles/layout-variables';

type TShirtSize = 'Small' | 'Medium' | 'Large';

export function getDataSize(ctx: Context): TShirtSize {
  const length = ctx.dataset.data.length;

  if (length < 30) return 'Small';
  else if (length < 90) return 'Medium';
  else return 'Large';
}

export function showDataPoint(ctx: Context): boolean {
  if (ctx.chart.width <= layouVariables.mobileBreakpoint.value) return false;

  const tShirtSize = getDataSize(ctx);

  const showLabelEveryNthPoint =
    tShirtSize === 'Large' ? 20 : tShirtSize == 'Medium' ? 5 : 1;

  // always show first point
  if (ctx.dataIndex === ctx.dataset.data.length - 1) return true;

  return ctx.dataIndex % showLabelEveryNthPoint === 0;
}

const unitOfMeasureByDatasetLabel = new Map<string, string>([
  ['Gewicht', 'kg'],
  ['Körperfett', '%'],
  ['Muskeln', '%'],
  ['Wasser', '%'],
  ['Bmi', ''],
  ['Täglicher Kalorienbedarf', 'kcal'],
]);

export function getUnitOfMeasureOrDefault(label: string | undefined): string {
  return unitOfMeasureByDatasetLabel.has(label ?? '')
    ? unitOfMeasureByDatasetLabel.get(label ?? '')!
    : '';
}

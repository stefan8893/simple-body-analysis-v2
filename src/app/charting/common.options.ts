import { Context } from 'chartjs-plugin-datalabels';
import { de } from 'date-fns/locale';
import { layouVariables } from '../../styles/layout-variables';
import { getUnitOfMeasureOrDefault, showDataPoint } from './chart-utils';

const documentStyle = getComputedStyle(document.documentElement);

const textColor = documentStyle.getPropertyValue('--text-color');
const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

export const commonOptions = {
  locale: 'de-AT',
  responsive: true,
  maintainAspectRatio: true,
  elements: {
    line: {
      cubicInterpolationMode: 'monotone',
    },
    point: {
      radius: (ctx: Context) => {
        if (showDataPoint(ctx)) {
          return 5;
        } else {
          return 0;
        }
      },
      pointHitRadius: 10,
    },
  },
  plugins: {
    datalabels: {
      display: (ctx: Context) => {
        return ctx.chart.width > layouVariables.mobileBreakpoint.value;
      },
      anchor: 'end',
      offset: 5,
      align: 'top',
      color: textColor,
      formatter: (value: any, ctx: Context) => {
        const unit = getUnitOfMeasureOrDefault(ctx.dataset.label);

        if (showDataPoint(ctx)) {
          return `${value} ${unit}`;
        } else {
          return '';
        }
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx: any) => {
          const unit = getUnitOfMeasureOrDefault(ctx.dataset.label);
          return `${ctx.dataset.label}: ${ctx.formattedValue} ${unit}`;
        },
      },
    },
    legend: {
      labels: {
        color: textColor,
      },
    },
  },
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'day',
        displayFormats: {
          day: 'P',
        },
        tooltipFormat: 'Pp',
      },
      ticks: {
        color: textColor,
        stepSize: 4,
        maxTicksLimit: 12,
      },
      grid: {
        color: surfaceBorder,
        display: false,
      },
      adapters: {
        date: {
          locale: de,
        },
      },
    },
    yLeft: {
      position: 'left',
      grace: '10%',
      ticks: {
        padding: 20,
      },
    },
    yRight: {
      position: 'right',
      grace: '30%',
      ticks: {
        padding: 20,
      },
      grid: {
        drawOnChartArea: false,
      },
    },
  },
};

import { Context } from 'chartjs-plugin-datalabels';
import { de } from 'date-fns/locale';
import { layouVariables } from '../../styles/layout-variables';
import { surfaceBorder, textColor } from '../components/body-analysis.colors';
import { getUnitOfMeasureOrDefault, showDataPoint } from './chart-utils';

const documentStyle = getComputedStyle(document.documentElement);

export const commonLineChartOptions = {
  locale: 'de-AT',
  responsive: true,
  maintainAspectRatio: true,
  elements: {
    line: {},
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
  animation: {
    duration: 700,
  },
  plugins: {
    datalabels: {
      display: (ctx: Context) => {
        return ctx.chart.width > layouVariables.mobileBreakpoint.value;
      },
      anchor: 'end',
      offset: 4,
      align: 'top',
      color: textColor,
      formatter: (value: any, ctx: Context) => {
        const unit = getUnitOfMeasureOrDefault(ctx.dataset.label);

        if (showDataPoint(ctx)) {
          return `${value.toLocaleString('de-AT')} ${unit}`;
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
      offset: false,
      time: {
        unit: 'day',
        displayFormats: {
          day: 'P',
        },
        tooltipFormat: 'Pp',
      },
      ticks: {
        color: textColor,
        stepSize: 2,
        maxTicksLimit: 8,
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
      grace: '50%',
      ticks: {
        padding: 20,
      },
      border: {
        display: false,
      },
    },
    yRight: {
      position: 'right',
      grace: '30%',
      ticks: {
        padding: 20,
      },
      grid: {
        drawOnChartArea: true,
      },
      border: {
        display: false,
      },
    },
  },
};

import {
  Component,
  computed,
  effect,
  input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Tooltip,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { CardModule } from 'primeng/card';
import { debounceTime, fromEvent, Observable, Subject, takeUntil } from 'rxjs';
import { layouVariables } from '../../../styles/layout-variables';
import { calculateWeekDifferences } from '../../body-analysis-data/aggregation/agg.functions';
import { BodyAnalysis } from '../../body-analysis-data/body-analysis.types';
import { getUnitOfMeasureOrDefault } from '../../charting/chart-utils';
import { Resource } from '../../infrastructure/resource.state';
import { surfaceBorder, textColor, weightColor } from '../body-analysis.colors';
import { SideNavState } from '../layout/layout/side-nav.state';

@Component({
  selector: 'app-dashboard-week-chart',
  standalone: true,
  imports: [CardModule],
  templateUrl: './dashboard-week-chart.component.html',
  styleUrl: './dashboard-week-chart.component.scss',
})
export class DashboardWeekChartComponent implements OnInit, OnDestroy {
  private windowResize$: Observable<Event>;
  private poisonPill$ = new Subject<void>();
  bodyAnalysisTableData = input<Resource<BodyAnalysis[]>>({ state: 'loading' });

  weeklyDifferences = computed(() => {
    const bodyAnalysisTableData = this.bodyAnalysisTableData();

    if (bodyAnalysisTableData.state !== 'loaded') return [];

    return calculateWeekDifferences(bodyAnalysisTableData.value);
  });

  weeklyChart: any;

  constructor(private sideNavStore: Store<{ sideNav: SideNavState }>) {
    Chart.register(
      BarController,
      BarElement,
      PointElement,
      CategoryScale,
      LinearScale,
      TimeScale,
      LineElement,
      ChartDataLabels,
      Filler,
      Legend,
      Tooltip
    );

    effect(() => {
      const weeklyDifferences = this.weeklyDifferences();

      if (weeklyDifferences.length === 0 || !this.weeklyChart) {
        this.clearChart();
        return;
      }

      const xAxis = weeklyDifferences.map((x) => x.firstDayOfWeek);
      const weightSeries = weeklyDifferences.map((x) => x.weightDiff);

      this.weeklyChart.data.labels = xAxis;
      this.weeklyChart.data.datasets[0].data = weightSeries;
      this.weeklyChart.update();
    });

    this.windowResize$ = fromEvent(window, 'resize');
  }
  clearChart() {
    this.weeklyChart.data.labels = [];
    this.weeklyChart.data.datasets[0].data = [];
    this.weeklyChart.update();
  }

  ngOnInit(): void {
    this.weeklyChart = new Chart('weekly-chart', {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Gewicht',
            data: [],
            backgroundColor: weightColor,
          },
        ],
      },
      options: {
        locale: 'de-AT',
        responsive: true,
        maintainAspectRatio: true,
        elements: {
          line: {},
          point: {},
        },
        layout: {
          padding: {
            right: 10,
            left: 10,
          },
        },
        plugins: {
          datalabels: {
            display: (ctx: Context) => {
              return ctx.chart.width > layouVariables.mobileBreakpoint.value;
            },
            anchor: function (ctx: Context) {
              if (ctx.dataIndex % 2 === 0) return 'start';
              else return 'end';
            },
            offset: 2,
            align: function (ctx: Context) {
              if (ctx.dataIndex % 2 === 0) return 'bottom';
              else return 'top';
            },
            color: textColor,
            formatter: (value: any, ctx: Context) => {
              const unit = getUnitOfMeasureOrDefault(ctx.dataset.label);

              return `${value.toLocaleString('de-AT')}${unit}`;
            },
          },
          tooltip: {
            callbacks: {
              title: (ctx: any) => {
                const weekNumber = ctx[0].label;
                const unixTimeStampInMilliseconds = ctx[0].parsed.x;
                const firstDayOfWeek = new Date(unixTimeStampInMilliseconds);

                return `KW ${weekNumber}\nStart ${format(firstDayOfWeek, 'P', {
                  locale: de,
                })}`;
              },
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
            title: {
              display: true,
              text: 'Kalenderwoche',
            },
            type: 'time',
            offset: true,
            time: {
              unit: 'week',
              displayFormats: {
                week: 'w',
              },
              tooltipFormat: 'w',
              isoWeekday: true,
            },
            ticks: {
              color: textColor,
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
          y: {
            ticks: {},
            border: {},
          },
        },
      },
    });

    this.windowResize$
      .pipe(debounceTime(150), takeUntil(this.poisonPill$))
      .subscribe(() => this.weeklyChart.resize());

    this.sideNavStore.pipe(takeUntil(this.poisonPill$)).subscribe(() => {
      setTimeout(() => this.weeklyChart.resize(), 50);
    });
  }

  ngOnDestroy(): void {
    this.poisonPill$.next();
    this.poisonPill$.complete();
  }
}

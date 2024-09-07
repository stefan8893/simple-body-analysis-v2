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
import { isMonday, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { CardModule } from 'primeng/card';
import { debounceTime, fromEvent, Observable, Subject, takeUntil } from 'rxjs';
import { BodyAnalysis } from '../../body-analysis-data/body-analysis.types';
import { surfaceBorder, textColor } from '../../charting/common.options';
import { Resource } from '../../infrastructure/resource.state';
import {
  bodyFatColor,
  bodyWaterColor,
  muscleMassColor,
  weightColor,
} from '../body-analysis.colors';
import { SideNavState } from '../layout/layout/side-nav.state';

type BodyAnalysisWeekly = {
  firstDayOfWeek: Date;
  weightDiff: number;
  muscleMassDiff: number;
  bodyWaterDiff: number;
  bodyFatDiff: number;
};

function calculateWeekDifferences(data: BodyAnalysis[]): BodyAnalysisWeekly[] {
  const mondays = data.filter((x) => isMonday(x.analysedAt));

  if (mondays.length < 2) return [];

  const firstMondaySkipped = mondays.slice(1);

  const weightDiff: BodyAnalysisWeekly[] = firstMondaySkipped.map((x, i) => ({
    firstDayOfWeek: startOfDay(mondays[i].analysedAt),
    weightDiff: x.weight - mondays[i].weight,
    muscleMassDiff: x.muscleMass - mondays[i].muscleMass,
    bodyWaterDiff: x.bodyWater - mondays[i].bodyWater,
    bodyFatDiff: x.bodyFat - mondays[i].bodyFat,
  }));

  return weightDiff;
}

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
      Filler,
      Legend,
      Tooltip
    );

    effect(() => {
      const weeklyDifferences = this.weeklyDifferences();

      if (weeklyDifferences.length === 0 || !this.weeklyChart) return;

      const xAxis = weeklyDifferences.map((x) => x.firstDayOfWeek);
      const weightSeries = weeklyDifferences.map((x) => x.weightDiff);
      const muscleMassSeries = weeklyDifferences.map((x) => x.muscleMassDiff);
      const bodyWaterSeries = weeklyDifferences.map((x) => x.bodyWaterDiff);
      const bodyFatSeries = weeklyDifferences.map((x) => x.bodyFatDiff);

      this.weeklyChart.data.labels = xAxis;
      this.weeklyChart.data.datasets[0].data = weightSeries;
      this.weeklyChart.data.datasets[1].data = muscleMassSeries;
      this.weeklyChart.data.datasets[2].data = bodyWaterSeries;
      this.weeklyChart.data.datasets[3].data = bodyFatSeries;
      this.weeklyChart.update();
    });

    this.windowResize$ = fromEvent(window, 'resize');
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
          {
            label: 'Muskeln',
            data: [],
            hidden: true,
            backgroundColor: muscleMassColor,
          },
          {
            label: 'Wasser',
            data: [],
            hidden: true,
            backgroundColor: bodyWaterColor,
          },
          {
            label: 'Fett',
            data: [],
            hidden: true,
            backgroundColor: bodyFatColor,
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
        plugins: {
          datalabels: {},
          tooltip: {},
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
              unit: 'week',
              displayFormats: {
                day: 'w',
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

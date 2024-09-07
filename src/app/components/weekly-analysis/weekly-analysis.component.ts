import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  CategoryScale,
  Chart,
  CoreChartOptions,
  ElementOptionsByType,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  TimeScale,
  Tooltip,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  isFriday,
  isMonday,
  isSaturday,
  isSunday,
  isThursday,
  isTuesday,
  isWednesday,
} from 'date-fns';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { debounceTime, fromEvent, Observable, Subject, takeUntil } from 'rxjs';
import { BodyAnalysisQueryService } from '../../body-analysis-data/body-analysis-query.service';
import { BodyAnalysis } from '../../body-analysis-data/body-analysis.types';
import { commonLineChartOptions } from '../../charting/common.options';
import { Resource } from '../../infrastructure/resource.state';
import {
  bodyFatColor,
  bodyWaterColor,
  muscleMassColor,
  weightColor,
} from '../body-analysis.colors';
import { SideNavState } from '../layout/layout/side-nav.state';
import { ContentHeaderComponent } from '../miscellaneous/content-header/content-header.component';
import { QuickSelectionCode } from '../miscellaneous/date-range-picker/available-quick-selections';
import { DateRangePickerComponent } from '../miscellaneous/date-range-picker/date-range-picker.component';
import { LoadingSpinnerComponent } from '../miscellaneous/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-weekly-analysis',
  standalone: true,
  imports: [
    ContentHeaderComponent,
    LoadingSpinnerComponent,
    CardModule,
    DropdownModule,
    DateRangePickerComponent,
    FormsModule,
  ],
  templateUrl: './weekly-analysis.component.html',
  styleUrl: './weekly-analysis.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class WeeklyAnalysisComponent implements OnInit, OnDestroy {
  private windowResize$: Observable<Event>;
  private poisonPill$ = new Subject<void>();

  private filterFnByWeekDay = new Map<string, (date: Date) => boolean>([
    ['Montag', (x: Date) => isMonday(x)],
    ['Dienstag', (x: Date) => isTuesday(x)],
    ['Mittwoch', (x: Date) => isWednesday(x)],
    ['Donnerstag', (x: Date) => isThursday(x)],
    ['Freitag', (x: Date) => isFriday(x)],
    ['Samstag', (x: Date) => isSaturday(x)],
    ['Sonntag', (x: Date) => isSunday(x)],
  ]);

  private latestPreparedDateRange: string[] = [];

  offerQuickSelections: QuickSelectionCode[] = [
    'L30D',
    'L2M',
    'L3M',
    'L6M',
    'CY',
    'LY',
    'PY',
    'L2Y',
  ];

  weekDays = [
    'Montag',
    'Dienstag',
    'Mittwoch',
    'Donnerstag',
    'Freitag',
    'Samstag',
    'Sonntag',
  ];
  selectedWeekDay = 'Montag';

  bodyAnalysisTableData: Resource<BodyAnalysis[]> = { state: 'loading' };

  weeklyChart: any;

  constructor(
    private bodyAnalysisQueryService: BodyAnalysisQueryService,
    private sideNavStore: Store<{ sideNav: SideNavState }>
  ) {
    Chart.register(
      LineController,
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

    this.windowResize$ = fromEvent(window, 'resize');
  }

  private clearChart() {
    this.weeklyChart.data.labels = [];
    this.weeklyChart.data.datasets[0].data = [];
    this.weeklyChart.data.datasets[1].data = [];
    this.weeklyChart.data.datasets[2].data = [];
    this.weeklyChart.data.datasets[3].data = [];
    this.weeklyChart.update();
  }

  ngOnInit() {
    this.weeklyChart = new Chart('weekly-chart', {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Gewicht',
            data: [],
            borderColor: weightColor,
            yAxisID: 'yLeft',
          },
          {
            label: 'Muskeln',
            data: [],
            hidden: true,
            borderColor: muscleMassColor,
            yAxisID: 'yLeft',
          },
          {
            label: 'Wasser',
            data: [],
            hidden: true,
            borderColor: bodyWaterColor,
            yAxisID: 'yLeft',
          },
          {
            label: 'Fett',
            data: [],
            hidden: true,
            borderColor: bodyFatColor,
            yAxisID: 'yRight',
          },
        ],
      },
      options: {
        ...(commonLineChartOptions as unknown as CoreChartOptions<'line'>),
        elements: {
          ...(commonLineChartOptions.elements as unknown as ElementOptionsByType<'line'>),
          point: {
            radius: undefined,
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

  onWeekDayChanged() {
    this.onPreparedDateRangeChanged(this.latestPreparedDateRange);
  }

  onPreparedDateRangeChanged(event: string[]) {
    const [from, to] = event;
    this.latestPreparedDateRange = event;

    if (event.length === 2) {
      this.loadBodyAnalysisData(from, to);
    } else {
      this.clearChart();
    }
  }

  async loadBodyAnalysisData(from: string, to: string) {
    try {
      this.bodyAnalysisTableData = {
        state: 'loading',
      };

      const result = await this.bodyAnalysisQueryService.query(from, to);
      const filtered = result.filter((x) =>
        this.filterFnByWeekDay.get(this.selectedWeekDay)!(x.analysedAt)
      );

      this.bodyAnalysisTableData = {
        state: 'loaded',
        value: filtered,
      };

      this.updateChart(this.bodyAnalysisTableData.value);
    } catch (error) {
      console.error(error);
      this.bodyAnalysisTableData = {
        state: 'error',
        errorDetails: `${error}`,
      };
    }
  }

  updateChart(data: BodyAnalysis[]) {
    const xAxis = data.map((x) => x.analysedAt);
    const weightSeries = data.map((x) => x.weight);
    const muscleMassSeries = data.map((x) => x.muscleMass);
    const bodyWaterSeries = data.map((x) => x.bodyWater);
    const bodyFatSeries = data.map((x) => x.bodyFat);

    this.weeklyChart.data.labels = xAxis;
    this.weeklyChart.data.datasets[0].data = weightSeries;
    this.weeklyChart.data.datasets[1].data = muscleMassSeries;
    this.weeklyChart.data.datasets[2].data = bodyWaterSeries;
    this.weeklyChart.data.datasets[3].data = bodyFatSeries;
    this.weeklyChart.update();
  }

  ngOnDestroy(): void {
    this.poisonPill$.next();
    this.poisonPill$.complete();
  }
}

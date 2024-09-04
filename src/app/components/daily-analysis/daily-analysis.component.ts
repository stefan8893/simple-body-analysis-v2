import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  CategoryScale,
  Chart,
  CoreChartOptions,
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
import { CardModule } from 'primeng/card';
import { debounceTime, fromEvent, Observable, Subject, takeUntil } from 'rxjs';
import { BodyAnalysisQueryService } from '../../body-analysis-data/body-analysis-query.service';
import { BodyAnalysis } from '../../body-analysis-data/body-analysis.types';
import { commonOptions } from '../../charting/common.options';
import { SideNavState } from '../layout/layout/side-nav.state';
import { ContentHeaderComponent } from '../miscellaneous/content-header/content-header.component';
import { DateRangePickerComponent } from '../miscellaneous/date-range-picker/date-range-picker.component';
import { LoadingSpinnerComponent } from '../miscellaneous/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-daily-analysis',
  standalone: true,
  imports: [
    ContentHeaderComponent,
    LoadingSpinnerComponent,
    CardModule,
    DateRangePickerComponent,
  ],
  templateUrl: './daily-analysis.component.html',
  styleUrl: './daily-analysis.component.scss',
})
export class DailyAnalysisComponent implements OnInit, OnDestroy {
  private windowResize$: Observable<Event>;
  private poisonPill$ = new Subject<void>();

  isLoading = false;

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

  dailyChart: any;

  private clearChart() {
    this.dailyChart.data.labels = [];
    this.dailyChart.data.datasets[0].data = [];
    this.dailyChart.data.datasets[1].data = [];
    this.dailyChart.data.datasets[2].data = [];
    this.dailyChart.data.datasets[3].data = [];
    this.dailyChart.update();
  }

  ngOnInit() {
    const documentStyle = getComputedStyle(document.documentElement);
    const weightColor = documentStyle.getPropertyValue('--primary-color');
    const muscleMassColor = documentStyle.getPropertyValue('--purple-700');
    const bodyFatColor = documentStyle.getPropertyValue('--orange-500');
    const bodyWaterColor = documentStyle.getPropertyValue('--cyan-500');

    this.dailyChart = new Chart('daily-chart', {
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
            label: 'Körperfett',
            data: [],
            hidden: true,
            borderColor: bodyFatColor,
            yAxisID: 'yRight',
          },
        ],
      },
      options: {
        ...(commonOptions as unknown as CoreChartOptions<'line'>),
      },
    });

    this.windowResize$
      .pipe(debounceTime(150), takeUntil(this.poisonPill$))
      .subscribe(() => this.dailyChart.resize());

    this.sideNavStore.pipe(takeUntil(this.poisonPill$)).subscribe(() => {
      setTimeout(() => this.dailyChart.resize(), 500);
    });
  }

  onPreparedDateRangeChanged(event: string[]) {
    const [from, to] = event;

    if (event.length !== 0) {
      this.loadTableData(from, to);
    } else {
      this.clearChart();
    }
  }

  async loadTableData(from: string, to: string) {
    try {
      this.isLoading = true;
      const result = await this.bodyAnalysisQueryService.query(from, to);

      this.updateChart(result);
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  updateChart(result: BodyAnalysis[]) {
    const xAxis = result.map((x) => x.analysedAt);
    const weightSeries = result.map((x) => x.weight);
    const muscleMassSeries = result.map((x) => x.muscleMass);
    const bodyWaterSeries = result.map((x) => x.bodyWater);
    const bodyFatSeries = result.map((x) => x.bodyFat);

    this.dailyChart.data.labels = xAxis;
    this.dailyChart.data.datasets[0].data = weightSeries;
    this.dailyChart.data.datasets[1].data = muscleMassSeries;
    this.dailyChart.data.datasets[2].data = bodyWaterSeries;
    this.dailyChart.data.datasets[3].data = bodyFatSeries;
    this.dailyChart.update();
  }

  ngOnDestroy(): void {
    this.poisonPill$.next();
    this.poisonPill$.complete();
  }
}

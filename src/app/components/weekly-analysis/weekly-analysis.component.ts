import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { Options } from 'chartjs-plugin-datalabels/types/options';
import { isMonday } from 'date-fns';
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
  selector: 'app-weekly-analysis',
  standalone: true,
  imports: [
    ContentHeaderComponent,
    LoadingSpinnerComponent,
    CardModule,
    DateRangePickerComponent,
  ],
  templateUrl: './weekly-analysis.component.html',
  styleUrl: './weekly-analysis.component.scss',
})
export class WeeklyAnalysisComponent implements OnInit, OnDestroy {
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

  weeklyChart: any;

  private clearChart() {
    this.weeklyChart.data.labels = [];
    this.weeklyChart.data.datasets[0].data = [];
    this.weeklyChart.data.datasets[1].data = [];
    this.weeklyChart.data.datasets[2].data = [];
    this.weeklyChart.data.datasets[3].data = [];
    this.weeklyChart.update();
  }

  ngOnInit() {
    const documentStyle = getComputedStyle(document.documentElement);
    const weightColor = documentStyle.getPropertyValue('--primary-color');
    const muscleMassColor = documentStyle.getPropertyValue('--purple-700');
    const bodyFatColor = documentStyle.getPropertyValue('--orange-500');
    const bodyWaterColor = documentStyle.getPropertyValue('--cyan-500');

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
        elements: {
          ...(commonOptions.elements as unknown as ElementOptionsByType<'line'>),
          point: {
            radius: undefined,
          },
        },
        plugins: {
          ...commonOptions.plugins,
          datalabels: {
            ...(commonOptions.plugins.datalabels as unknown as Options),
            formatter: undefined,
          },
        },
      },
    });

    this.windowResize$
      .pipe(debounceTime(150), takeUntil(this.poisonPill$))
      .subscribe(() => this.weeklyChart.resize());

    this.sideNavStore.pipe(takeUntil(this.poisonPill$)).subscribe(() => {
      setTimeout(() => this.weeklyChart.resize(), 500);
    });
  }

  onPreparedDateRangeChanged(event: string[]) {
    const [from, to] = event;

    if (event.length !== 0) {
      this.loadBodyAnalysisData(from, to);
    } else {
      this.clearChart();
    }
  }

  async loadBodyAnalysisData(from: string, to: string) {
    try {
      this.isLoading = true;
      const result = await this.bodyAnalysisQueryService.query(from, to);
      const onlyMondays = result.filter((x) => isMonday(x.analysedAt));

      this.updateChart(onlyMondays);
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

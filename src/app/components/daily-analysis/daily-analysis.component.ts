import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  CategoryScale,
  Chart,
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
import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels';
import { de } from 'date-fns/locale';
import { CardModule } from 'primeng/card';
import { debounceTime, fromEvent, Observable, Subject, takeUntil } from 'rxjs';
import { layouVariables } from '../../../styles/layout-variables';
import { BodyAnalysisQueryService } from '../../body-analysis-data/body-analysis-query.service';
import { BodyAnalysis } from '../../body-analysis-data/body-analysis.types';
import { sampleData } from '../../body-analysis-data/sample-data';
import { ContentHeaderComponent } from '../miscellaneous/content-header/content-header.component';
import { DateRangePickerComponent } from '../miscellaneous/date-range-picker/date-range-picker.component';

type TShirtSize = 'Small' | 'Medium' | 'Large';

@Component({
  selector: 'app-daily-analysis',
  standalone: true,
  imports: [ContentHeaderComponent, CardModule, DateRangePickerComponent],
  templateUrl: './daily-analysis.component.html',
  styleUrl: './daily-analysis.component.scss',
})
export class DailyAnalysisComponent implements OnInit, OnDestroy {
  private windowResize$: Observable<Event>;
  private poisonPill$ = new Subject<void>();

  isLoading = false;

  constructor(private bodyAnalysisQueryService: BodyAnalysisQueryService) {
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
  ngOnDestroy(): void {
    this.poisonPill$.next();
    this.poisonPill$.complete();
  }

  dailyChart: any;

  private unitOfMeasureByDatasetLabel = new Map<string, string>([
    ['Gewicht', 'kg'],
    ['Körperfett', '%'],
    ['Muskeln', '%'],
    ['Wasser', '%'],
    ['Bmi', ''],
    ['Täglicher Kalorienbedarf', 'kcal'],
  ]);

  private getUnitOfMeasureOrDefault(label: string | undefined): string {
    return this.unitOfMeasureByDatasetLabel.has(label ?? '')
      ? this.unitOfMeasureByDatasetLabel.get(label ?? '')!
      : '';
  }

  ngOnInit() {
    const documentStyle = getComputedStyle(document.documentElement);
    const weightColor = documentStyle.getPropertyValue('--primary-color');
    const muscleMassColor = documentStyle.getPropertyValue('--purple-700');
    const bodyFatColor = documentStyle.getPropertyValue('--orange-500');
    const bodyWaterColor = documentStyle.getPropertyValue('--cyan-500');

    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    const xAxis = sampleData.map((x) => x.analysedAt);
    const weightSeries = sampleData.map((x) => x.weight);
    const bodyFatSeries = sampleData.map((x) => x.bodyFat);
    const muscleMass = sampleData.map((x) => x.muscleMass);
    const bodyWater = sampleData.map((x) => x.bodyWater);

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
        locale: 'de-AT',
        responsive: true,
        maintainAspectRatio: true,
        elements: {
          line: {
            cubicInterpolationMode: 'monotone',
          },
          point: {
            radius: (ctx) => {
              if (this.showDataPoint(ctx)) {
                return 3;
              } else {
                return 0;
              }
            },
          },
        },
        plugins: {
          datalabels: {
            display: (ctx) => {
              return ctx.chart.width > layouVariables.mobileBreakpoint.value;
            },
            anchor: 'end',
            offset: 5,
            align: 'top',
            color: textColor,
            formatter: (value, ctx) => {
              const unit = this.getUnitOfMeasureOrDefault(ctx.dataset.label);

              if (this.showDataPoint(ctx)) {
                return `${value} ${unit}`;
              } else {
                return '';
              }
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const unit = this.getUnitOfMeasureOrDefault(ctx.dataset.label);
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
      },
    });

    this.windowResize$
      .pipe(debounceTime(150), takeUntil(this.poisonPill$))
      .subscribe(() => this.dailyChart.resize());
  }

  getDataSize(ctx: Context): TShirtSize {
    const length = ctx.dataset.data.length;

    if (length < 30) return 'Small';
    else if (length < 90) return 'Medium';
    else return 'Large';
  }

  showDataPoint(ctx: Context) {
    if (ctx.chart.width <= layouVariables.mobileBreakpoint.value) return false;

    const tShirtSize = this.getDataSize(ctx);

    const showLabelEveryNthPoint =
      tShirtSize === 'Large' ? 20 : tShirtSize == 'Medium' ? 5 : 1;

    if (ctx.dataIndex === ctx.dataset.data.length - 1) return true;

    return ctx.dataIndex % showLabelEveryNthPoint === 0;
  }

  onPreparedDateRangeChanged(event: string[]) {
    const [from, to] = event;

    if (event.length !== 0) {
      this.loadTableData(from, to);
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
}

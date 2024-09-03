import { Component, OnInit } from '@angular/core';
import 'chartjs-adapter-date-fns';
import { de } from 'date-fns/locale';
import { ChartModule } from 'primeng/chart';
import { BodyAnalysisQueryService } from '../../body-analysis-data/body-analysis-query.service';
import { BodyAnalysis } from '../../body-analysis-data/body-analysis.types';
import { ContentHeaderComponent } from '../miscellaneous/content-header/content-header.component';
import { DateRangePickerComponent } from '../miscellaneous/date-range-picker/date-range-picker.component';

@Component({
  selector: 'app-daily-analysis',
  standalone: true,
  imports: [ContentHeaderComponent, DateRangePickerComponent, ChartModule],
  templateUrl: './daily-analysis.component.html',
  styleUrl: './daily-analysis.component.scss',
})
export class DailyAnalysisComponent implements OnInit {
  isLoading = false;

  constructor(private bodyAnalysisQueryService: BodyAnalysisQueryService) {}

  data: any;

  options: any;

  ngOnInit() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.data = {
      labels: [],
      datasets: [
        // {
        //   label: 'First Dataset',
        //   data: [65, 59, 80, 81, 56, 55, 40],
        //   fill: false,
        //   borderColor: documentStyle.getPropertyValue('--blue-500'),
        //   tension: 0.4,
        // },
      ],
    };

    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
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
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
          adapters: {
            date: {
              locale: de,
            },
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };
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

      console.log('result', result);

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
    const bodyFatSeries = result.map((x) => x.bodyFat);

    this.data.labels = xAxis;
    this.data.datasets = [
      {
        label: 'Gewicht',
        data: weightSeries,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Körperfett',
        data: bodyFatSeries,
        fill: false,
        tension: 0.4,
      },
    ];

    this.data = { ...this.data };
  }
}

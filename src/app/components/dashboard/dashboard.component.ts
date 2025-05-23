import {
  Component,
  computed,
  Signal,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import {
  calculateWeekDifferences,
  calculateWidgetValues,
  nullWidgetValues,
} from '../../body-analysis-data/aggregation/agg.functions';
import { WidgetValues } from '../../body-analysis-data/aggregation/data.types';
import { BodyAnalysisQueryService } from '../../body-analysis-data/body-analysis-query.service';
import { BodyAnalysis } from '../../body-analysis-data/body-analysis.types';
import { Resource } from '../../infrastructure/resource.state';
import { DashboardWeekChartComponent } from '../dashboard-week-chart/dashboard-week-chart.component';
import { DashboardWidgetComponent } from '../dashboard-widget/dashboard-widget.component';
import { QuickSelectionCode } from '../miscellaneous/date-range-picker/available-quick-selections';
import { DateRangePickerComponent } from '../miscellaneous/date-range-picker/date-range-picker.component';
import { LoadingSpinnerComponent } from '../miscellaneous/loading-spinner/loading-spinner.component';
import {
  currentBodyFatKnobSettings as bodyFatKnobSettings,
  currentBodyWaterKnobSettings as bodyWaterKnobSettings,
  currentMuscleMassKnobSettings as muscleMassKnobSettings,
  currentWeightKnobSettings as weightKnobSettings,
} from './knobsettings';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CardModule,
    DateRangePickerComponent,
    DashboardWidgetComponent,
    DashboardWeekChartComponent,
    LoadingSpinnerComponent,
    FormsModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent {
  constructor(private bodyAnalysisQueryService: BodyAnalysisQueryService) {}

  bodyAnalysisTableData = signal<Resource<BodyAnalysis[]>>({
    state: 'loading',
  });

  weeklyDifferences = computed(() => {
    const bodyAnalysisTableData = this.bodyAnalysisTableData();

    if (bodyAnalysisTableData.state !== 'loaded') return [];

    return calculateWeekDifferences(bodyAnalysisTableData.value);
  });

  offerQuickSelections: QuickSelectionCode[] = [
    'L30D',
    'L2M',
    'L3M',
    'L6M',
    'CY',
    'LY',
    'L2Y',
    'CUSTOM',
  ];

  weightKnobSettings = weightKnobSettings;
  muscleMassKnobSettings = muscleMassKnobSettings;
  bodyWaterKnobSettings = bodyWaterKnobSettings;
  bodyFatKnobSettings = bodyFatKnobSettings;

  weightWidgetValues: Signal<WidgetValues> = computed(() => {
    const resource = this.bodyAnalysisTableData();
    if (resource.state !== 'loaded') return nullWidgetValues;

    return calculateWidgetValues(resource.value, 'weight');
  });

  muscleMassWidgetValues: Signal<WidgetValues> = computed(() => {
    const resource = this.bodyAnalysisTableData();
    if (resource.state !== 'loaded') return nullWidgetValues;

    return calculateWidgetValues(resource.value, 'muscleMass');
  });

  bodyWaterWidgetValues: Signal<WidgetValues> = computed(() => {
    const resource = this.bodyAnalysisTableData();
    if (resource.state !== 'loaded') return nullWidgetValues;

    return calculateWidgetValues(resource.value, 'bodyWater');
  });

  bodyFatWidgetValues: Signal<WidgetValues> = computed(() => {
    const resource = this.bodyAnalysisTableData();
    if (resource.state !== 'loaded') return nullWidgetValues;

    return calculateWidgetValues(resource.value, 'bodyFat');
  });

  onPreparedDateRangeChanged(event: string[]) {
    const [from, to] = event;

    if (event.length === 2) this.loadBodyAnalysisData(from, to);
  }

  async loadBodyAnalysisData(from: string, to: string) {
    try {
      this.bodyAnalysisTableData.set({
        state: 'loading',
      });

      const result = await this.bodyAnalysisQueryService.query(from, to);

      this.bodyAnalysisTableData.set({
        state: 'loaded',
        value: result,
      });
    } catch (error) {
      console.error(error);
      this.bodyAnalysisTableData.set({
        state: 'error',
        errorDetails: `${error}`,
      });
    }
  }
}

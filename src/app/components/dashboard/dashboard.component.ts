import {
  Component,
  computed,
  Signal,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { BodyAnalysisQueryService } from '../../body-analysis-data/body-analysis-query.service';
import { BodyAnalysis } from '../../body-analysis-data/body-analysis.types';
import { Resource } from '../../infrastructure/resource.state';
import {
  calculateWidgetValues,
  nullWidgetValues,
} from '../../widget-data/widget-data.functions';
import { WidgetValues } from '../../widget-data/widget-data.types';
import { AnalysisWidgetComponent } from '../miscellaneous/analysis-widget/analysis-widget.component';
import { ContentHeaderComponent } from '../miscellaneous/content-header/content-header.component';
import { QuickSelectionCode } from '../miscellaneous/date-range-picker/available-quick-selections';
import { DateRangePickerComponent } from '../miscellaneous/date-range-picker/date-range-picker.component';
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
    ContentHeaderComponent,
    DateRangePickerComponent,
    AnalysisWidgetComponent,
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

  offerQuickSelections: QuickSelectionCode[] = [
    'L14D',
    'L30D',
    'L2M',
    'L3M',
    'L6M',
    'CY',
    'LY',
    'PY',
    'L2Y',
  ];

  weightKnobSettings = weightKnobSettings;
  muscleMassKnobSettings = muscleMassKnobSettings;
  bodyWaterKnobSettings = bodyWaterKnobSettings;
  bodyFatKnobSettings = bodyFatKnobSettings;

  weightWidgetValues: Signal<WidgetValues> = computed(() => {
    const resource = this.bodyAnalysisTableData();
    if (resource.state === 'loaded')
      return calculateWidgetValues(resource.value, 'weight');
    else return nullWidgetValues;
  });

  muscleMassWidgetValues: Signal<WidgetValues> = computed(() => {
    const resource = this.bodyAnalysisTableData();
    if (resource.state === 'loaded')
      return calculateWidgetValues(resource.value, 'muscleMass');
    else return nullWidgetValues;
  });

  bodyWaterWidgetValues: Signal<WidgetValues> = computed(() => {
    const resource = this.bodyAnalysisTableData();
    if (resource.state === 'loaded')
      return calculateWidgetValues(resource.value, 'bodyWater');
    else return nullWidgetValues;
  });

  bodyFatWidgetValues: Signal<WidgetValues> = computed(() => {
    const resource = this.bodyAnalysisTableData();
    if (resource.state === 'loaded')
      return calculateWidgetValues(resource.value, 'bodyFat');
    else return nullWidgetValues;
  });

  onPreparedDateRangeChanged(event: string[]) {
    const [from, to] = event;

    if (event.length === 2) {
      this.loadBodyAnalysisData(from, to);
    } else {
      console.log('clear dashborad');
    }
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

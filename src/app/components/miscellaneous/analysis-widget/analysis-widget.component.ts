import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  input,
  model,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { KnobModule } from 'primeng/knob';
import { SkeletonModule } from 'primeng/skeleton';
import { Unit } from '../../../infrastructure/units';
import { primaryColor } from '../../body-analysis.colors';

export type KnobSettings = {
  color: string;
  unit: Unit;
  min: number;
  max: number;
};

@Component({
  selector: 'app-analysis-widget',
  standalone: true,
  imports: [CardModule, FormsModule, KnobModule, SkeletonModule, CommonModule],
  templateUrl: './analysis-widget.component.html',
  styleUrl: './analysis-widget.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AnalysisWidgetComponent {
  isLoading = input(false);
  title = input('');
  knobSettings = input<KnobSettings>({
    color: primaryColor,
    unit: '',
    min: 0,
    max: 100,
  });

  latestValue = model<number | undefined | null>(undefined);
  lossGainInSelectedDateRange = input<number | undefined | null>(undefined);
  averageWeeklyLossGain = input<number | undefined | null>(undefined);

  lossGainInSelectedDateRangeAbs = computed(() => {
    const lossGain = this.lossGainInSelectedDateRange();

    if (!!lossGain) return Math.abs(lossGain);
    else return null;
  });

  averageWeeklyLossGainAbs = computed(() => {
    const lossGain = this.averageWeeklyLossGain();

    if (!!lossGain) return Math.abs(lossGain);
    else return null;
  });

  lossGainInSelectedDateRangeDirectionIcon = computed(() => {
    const lossGain = this.lossGainInSelectedDateRange();
    if (!lossGain || lossGain === 0) {
      return '';
    }

    return lossGain < 0 ? 'pi-arrow-down' : 'pi-arrow-up';
  });

  valueTemplate = computed(() => `{value}${this.knobSettings().unit}`);
}

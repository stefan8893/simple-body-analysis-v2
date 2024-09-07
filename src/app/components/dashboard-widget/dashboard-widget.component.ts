import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  input,
  model,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { CardModule } from 'primeng/card';
import { KnobModule } from 'primeng/knob';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { Unit } from '../../infrastructure/units';
import { primaryColor } from '../body-analysis.colors';

export type KnobSettings = {
  color: string;
  unit: Unit;
  min: number;
  max: number;
};

@Component({
  selector: 'app-dashboard-widget',
  standalone: true,
  imports: [
    CardModule,
    FormsModule,
    KnobModule,
    TooltipModule,
    SkeletonModule,
    CommonModule,
  ],
  templateUrl: './dashboard-widget.component.html',
  styleUrl: './dashboard-widget.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DashboardWidgetComponent {
  isLoading = input(false);
  header = input('');
  knobSettings = input<KnobSettings>({
    color: primaryColor,
    unit: '',
    min: 0,
    max: 100,
  });

  selectedDateRangeFrom = input<Date | undefined | null>(undefined);
  selectedDateRangeTo = input<Date | undefined | null>(undefined);
  latestValue = model<number | undefined | null>(undefined);
  lossGainInSelectedDateRange = input<number | undefined | null>(undefined);
  averageWeeklyLossGain = input<number | undefined | null>(undefined);

  selectedDateRangeFromFormatted = computed(() => {
    const analysedAt = this.selectedDateRangeFrom();
    if (!analysedAt) return '';

    return `seit ${format(analysedAt, 'P', { locale: de })}`;
  });

  selectedDateRangeToFormatted = computed(() => {
    const analysedAt = this.selectedDateRangeTo();
    if (!analysedAt) return '';

    return format(analysedAt, 'Pp', { locale: de });
  });

  lossGainInSelectedDateRangeAbs = computed(() => {
    const lossGain = this.lossGainInSelectedDateRange();

    if (lossGain != undefined || lossGain != null) return Math.abs(lossGain);
    else return null;
  });

  averageWeeklyLossGainAbs = computed(() => {
    const lossGain = this.averageWeeklyLossGain();

    if (lossGain != undefined || lossGain != null) return Math.abs(lossGain);
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

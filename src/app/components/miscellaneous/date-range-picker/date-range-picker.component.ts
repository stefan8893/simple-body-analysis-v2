import {
  Component,
  effect,
  input,
  model,
  OnInit,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { addDays, endOfDay, format, parseISO, startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import {
  availableQuickSelections,
  QuickSelection,
  QuickSelectionCode,
} from './available-quick-selections';

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CalendarModule, DropdownModule, FormsModule],
  templateUrl: './date-range-picker.component.html',
  styleUrl: './date-range-picker.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DateRangePickerComponent implements OnInit {
  dateRangeRaw = model<Date[] | undefined>(undefined);
  preparedDateRangeChanged = output<string[]>();
  initialRange = input<string | null>(null);
  offerQuickSelections = input<QuickSelectionCode[] | undefined>(undefined);
  minDate = parseISO('2000-01-01T00:00:00Z');
  maxDate = addDays(new Date(), 2);
  hideInput = true;

  quickSelections: QuickSelection[] = [];

  selectedQuickSelection: QuickSelection | undefined;

  constructor() {
    effect(() => {
      const rawRange = this.dateRangeRaw() ?? [];

      if (rawRange.length === 0) {
        this.preparedDateRangeChanged.emit([]);
        return;
      }

      const [from, to] = rawRange;
      if (!from || !to) {
        return;
      }

      const timeZone = 'Europe/Vienna';
      const fromLocalTime = startOfDay(toZonedTime(from, timeZone));
      const toLocalTime = endOfDay(toZonedTime(to, timeZone));

      const fromSearchString = this.formatToSearchString(fromLocalTime);
      const toSearchString = this.formatToSearchString(toLocalTime);

      console.debug('Prepared DateRange changed event get emitted:', {
        from: fromSearchString,
        to: toSearchString,
      });

      this.preparedDateRangeChanged.emit([fromSearchString, toSearchString]);
    });
  }

  private formatToSearchString(date: Date) {
    return format(date, `yyyy-MM-dd'T'HH:mm`);
  }

  applyInitialQuickSelection(code: string) {
    const quickSelection = this.quickSelections.find((x) => x.code === code);

    if (!quickSelection) return;

    this.selectedQuickSelection = quickSelection;
    this.dateRangeRaw.update(() => quickSelection.range());
  }

  ngOnInit(): void {
    if (!!this.offerQuickSelections()) {
      this.quickSelections = availableQuickSelections.filter((available) =>
        this.offerQuickSelections()?.some((offer) => offer === available.code)
      );
    } else {
      this.quickSelections = availableQuickSelections;
    }

    const code = this.initialRange() ?? 'L7D';

    if (this.quickSelections.some((x) => x.code === code)) {
      this.applyInitialQuickSelection(code);
    }
  }

  onDateRangeSelected(_event: any) {}

  onQuickSelectionChanged({ value }: { value: QuickSelection | undefined }) {
    if (!value) return;

    if (value.code === 'CUSTOM') this.hideInput = false;
    else this.hideInput = true;

    this.dateRangeRaw.update(() => value.range());
  }
}

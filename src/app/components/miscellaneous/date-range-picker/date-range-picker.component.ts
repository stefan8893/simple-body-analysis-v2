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
import {
  addDays,
  endOfDay,
  endOfYear,
  format,
  parseISO,
  startOfDay,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';

type QuickSelection = {
  name: string;
  code: string;
  range: () => Date[];
};

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
  minDate = parseISO('2000-01-01T00:00:00Z');
  maxDate = addDays(new Date(), 2);

  quickSelections: QuickSelection[] = [
    {
      name: 'Letzte 7 Tage',
      code: 'L7D',
      range: () => {
        const from = startOfDay(subDays(new Date(), 6));
        const to = endOfDay(new Date());

        return [from, to];
      },
    },
    {
      name: 'Letzte 30 Tage',
      code: 'L30D',
      range: () => {
        const from = startOfDay(subDays(new Date(), 29));
        const to = endOfDay(new Date());

        return [from, to];
      },
    },
    {
      name: 'Letzte 2 Monate',
      code: 'L2M',
      range: () => {
        const from = startOfDay(subMonths(addDays(new Date(), 1), 2));
        const to = endOfDay(new Date());

        return [from, to];
      },
    },
    {
      name: 'Letzte 6 Monate',
      code: 'L6M',
      range: () => {
        const from = startOfDay(subMonths(addDays(new Date(), 1), 6));
        const to = endOfDay(new Date());

        return [from, to];
      },
    },
    {
      name: 'Letztes Jahr',
      code: 'LY',
      range: () => {
        const from = startOfDay(subYears(addDays(new Date(), 1), 1));
        const to = endOfDay(new Date());

        return [from, to];
      },
    },
    {
      name: 'Akutelles Jahr',
      code: 'CY',
      range: () => {
        const from = startOfYear(new Date());
        const to = endOfDay(new Date());

        return [from, to];
      },
    },
    {
      name: 'Vorheriges Jahr',
      code: 'PY',
      range: () => {
        const oneYearAgo = subYears(new Date(), 1);
        const from = startOfYear(oneYearAgo);
        const to = endOfYear(oneYearAgo);

        return [from, to];
      },
    },
    {
      name: 'Letzte 2 Jahre',
      code: 'L2Y',
      range: () => {
        const from = subYears(addDays(new Date(), 1), 2);
        const to = endOfDay(new Date());

        return [from, to];
      },
    },
  ];

  selectedQuickSelection: QuickSelection | undefined;

  constructor() {
    effect(() => {
      const rawRange = this.dateRangeRaw() ?? [];

      if (rawRange.length === 0) {
        this.preparedDateRangeChanged.emit([]);
        this.selectedQuickSelection = undefined;
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

  applyQuickSelectionDateRange(code: string) {
    const quickSelection = this.quickSelections.find((x) => x.code === code);

    if (!quickSelection) return;

    this.selectedQuickSelection = quickSelection;
    this.dateRangeRaw.update(() => quickSelection.range());
  }

  ngOnInit(): void {
    const code = this.initialRange() ?? 'L7D';
    this.applyQuickSelectionDateRange(code);
  }

  onDateRangeSelected(event: any) {
    this.selectedQuickSelection = undefined;
  }

  onQuickSelectionChanged({ value }: { value: QuickSelection | undefined }) {
    if (!value) return;

    this.dateRangeRaw.update(() => value.range());
  }
}

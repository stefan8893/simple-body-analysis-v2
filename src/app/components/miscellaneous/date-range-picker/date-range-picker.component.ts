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
import { MenuModule } from 'primeng/menu';

type QuickSelection = {
  name: string;
  code: string;
  range: () => Date[];
};

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CalendarModule, MenuModule, DropdownModule, FormsModule],
  templateUrl: './date-range-picker.component.html',
  styleUrl: './date-range-picker.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DateRangePickerComponent implements OnInit {
  dateRangeRaw = model<Date[] | undefined>(undefined);
  preparedDateRangeChanged = output<string[]>();
  initialRange = input<Date[] | null>(null);
  minDate = parseISO('2000-01-01T00:00:00Z');
  maxDate = addDays(new Date(), 2);

  quickSelections: QuickSelection[] = [
    {
      code: 'L7D',
      name: 'Letzte 7 Tage',
      range: () => {
        const from = startOfDay(subDays(new Date(), 6));
        const to = endOfDay(new Date());

        return [from, to];
      },
    },
    {
      code: 'L30D',
      name: 'Letzte 30 Tage',
      range: () => {
        const from = startOfDay(subDays(new Date(), 29));
        const to = endOfDay(new Date());

        return [from, to];
      },
    },
    {
      code: 'L2M',
      name: 'Letzte 2 Monate',
      range: () => {
        const from = startOfDay(subMonths(addDays(new Date(), 1), 2));
        const to = endOfDay(new Date());

        return [from, to];
      },
    },
    {
      code: 'L6M',
      name: 'Letzte 6 Monate',
      range: () => {
        const from = startOfDay(subMonths(addDays(new Date(), 1), 6));
        const to = endOfDay(new Date());

        return [from, to];
      },
    },
    {
      code: 'CY',
      name: 'Akutelles Jahr',
      range: () => {
        const from = startOfYear(new Date());
        const to = endOfDay(new Date());

        return [from, to];
      },
    },
    {
      code: 'LY',
      name: 'Letztes Jahr',
      range: () => {
        const oneYearAgo = subYears(new Date(), 1);
        const from = startOfYear(oneYearAgo);
        const to = endOfYear(oneYearAgo);

        return [from, to];
      },
    },
    {
      code: 'L2Y',
      name: 'Letzte 2 Jahre',
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

  ngOnInit(): void {
    const [initialFrom, initialTo] = this.initialRange() ?? [];

    if (!initialFrom || !initialTo) return;

    if (initialFrom >= this.minDate && initialTo <= this.maxDate) {
      this.dateRangeRaw.set([initialFrom, initialTo]);
    }
  }

  onDateRangeSelected(event: any) {
    this.selectedQuickSelection = undefined;
  }

  onQuickSelectionChanged({ value }: { value: QuickSelection | undefined }) {
    if (!value) return;

    this.dateRangeRaw.update(() => value.range());
  }
}

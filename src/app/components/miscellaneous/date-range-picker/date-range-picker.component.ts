import {
  Component,
  input,
  model,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  addDays,
  endOfDay,
  parseISO,
  startOfDay,
  startOfYear,
  subDays,
  subMonths,
} from 'date-fns';
import { CalendarModule } from 'primeng/calendar';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CalendarModule, MenuModule, FormsModule],
  templateUrl: './date-range-picker.component.html',
  styleUrl: './date-range-picker.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DateRangePickerComponent implements OnInit {
  dateRange = model<Date[] | undefined>(undefined);
  initialRange = input<Date[] | null>(null);
  minDate = parseISO('2021-01-01T00:00:00Z');
  maxDate = addDays(new Date(), 2);

  ngOnInit(): void {
    const [initialFrom, initialTo] = this.initialRange() ?? [];

    if (!initialFrom || !initialTo) return;

    if (initialFrom >= this.minDate && initialTo <= this.maxDate) {
      this.dateRange.set([initialFrom, initialTo]);
    }
  }

  fastSelectionItems = [
    {
      label: 'Schnellauswahl',
      items: [
        {
          label: 'Letzte 7 Tage',
          command: () => {
            const from = startOfDay(subDays(new Date(), 6));
            const to = endOfDay(new Date());

            this.dateRange.update(() => [from, to]);
          },
        },
        {
          label: 'Letzte 28 Tage',
          command: () => {
            const from = startOfDay(subDays(new Date(), 27));
            const to = endOfDay(new Date());

            this.dateRange.update(() => [from, to]);
          },
        },
        {
          label: 'Letzte 2 Monate',
          command: () => {
            const from = startOfDay(subMonths(subDays(new Date(), 1), 2));
            const to = endOfDay(new Date());

            this.dateRange.update(() => [from, to]);
          },
        },
        {
          label: 'Letzte 6 Monate',
          command: () => {
            const from = startOfDay(subMonths(subDays(new Date(), 1), 6));
            const to = endOfDay(new Date());

            this.dateRange.update(() => [from, to]);
          },
        },
        {
          label: 'Akutelles Jahr',
          command: () => {
            const from = startOfYear(new Date());
            const to = endOfDay(new Date());

            this.dateRange.update(() => [from, to]);
          },
        },
      ],
    },
  ];
}

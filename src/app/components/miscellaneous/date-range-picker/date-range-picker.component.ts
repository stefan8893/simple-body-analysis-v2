import { Component, computed, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { addDays, parseISO } from 'date-fns';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CalendarModule, FormsModule],
  templateUrl: './date-range-picker.component.html',
  styleUrl: './date-range-picker.component.scss',
})
export class DateRangePickerComponent {
  dateRange = model<Date[] | undefined>(undefined);
  refresh = output<void>();
  minDate = parseISO('2021-01-01T00:00:00Z');
  maxDate = addDays(new Date(), 2);

  isRefreshButtonEnabled = computed(
    () => this.dateRange()?.filter((x) => !!x).length === 2
  );

  triggerRefresh() {
    this.refresh.emit();
  }
}

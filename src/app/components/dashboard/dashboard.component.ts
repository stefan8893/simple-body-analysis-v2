import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { ContentHeaderComponent } from '../miscellaneous/content-header/content-header.component';
import { QuickSelectionCode } from '../miscellaneous/date-range-picker/available-quick-selections';
import { DateRangePickerComponent } from '../miscellaneous/date-range-picker/date-range-picker.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CardModule,
    ContentHeaderComponent,
    DateRangePickerComponent,
    DropdownModule,
    FormsModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent {
  weekDays = [
    'Montag',
    'Dienstag',
    'Mittwoch',
    'Donnerstag',
    'Freitag',
    'Samstag',
    'Sonntag',
  ];
  selectedWeekDay = 'Montag';
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

  onWeekDayChanged() {
    console.log('week day changed', this.selectedWeekDay);
  }

  onPreparedDateRangeChanged(event: string[]) {
    const [from, to] = event;

    if (event.length === 2) {
      console.log('load data and refresh dashboard');
    } else {
      console.log('clear dashborad');
    }
  }
}

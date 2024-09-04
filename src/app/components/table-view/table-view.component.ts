import { CommonModule } from '@angular/common';
import { Component, signal, ViewEncapsulation } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { BodyAnalysisQueryService } from '../../body-analysis-data/body-analysis-query.service';
import { BodyAnalysis } from '../../body-analysis-data/body-analysis.types';
import { FormatDatePipe } from '../../pipes/date-fns-format.pipe';
import { ContentHeaderComponent } from '../miscellaneous/content-header/content-header.component';
import { DateRangePickerComponent } from '../miscellaneous/date-range-picker/date-range-picker.component';

@Component({
  selector: 'app-table-view',
  standalone: true,
  imports: [
    CommonModule,
    ContentHeaderComponent,
    DateRangePickerComponent,
    ButtonModule,
    TableModule,
    CardModule,
    FormatDatePipe,
  ],
  templateUrl: './table-view.component.html',
  styleUrl: './table-view.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TableViewComponent {
  dateRangeRaw = signal<Date[]>([]);
  rows: BodyAnalysis[] = [];
  isLoading = false;

  constructor(private bodyAnalysisQueryService: BodyAnalysisQueryService) {}

  onPreparedDateRangeChanged(event: string[]) {
    const [from, to] = event;

    if (event.length === 0) {
      this.rows = [];
    } else {
      this.loadTableData(from, to);
    }
  }

  async loadTableData(from: string, to: string) {
    try {
      this.isLoading = true;
      const result = await this.bodyAnalysisQueryService.query(from, to);

      this.rows = result;
    } catch (error) {
      this.rows = [];
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
}

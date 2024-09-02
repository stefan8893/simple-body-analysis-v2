import {
  Component,
  effect,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { TableClient } from '@azure/data-tables';
import { endOfDay, format } from 'date-fns';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { BodyAnalysis } from '../../body-analysis-data/body-analysis.types';
import { FormatDatePipe } from '../../infrastructure/date-fns-format.pipe';
import { ContentHeaderComponent } from '../miscellaneous/content-header/content-header.component';
import { DateRangePickerComponent } from '../miscellaneous/date-range-picker/date-range-picker.component';

@Component({
  selector: 'app-table-view',
  standalone: true,
  imports: [
    ContentHeaderComponent,
    DateRangePickerComponent,
    ButtonModule,
    TableModule,
    FormatDatePipe,
  ],
  templateUrl: './table-view.component.html',
  styleUrl: './table-view.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TableViewComponent implements OnInit {
  constructor(private bodyAnalysisTable: TableClient) {
    effect(() => {
      const [from, to] = this.dateRangeFilter() ?? [];
      if (!!from && !!to) {
        this.loadTableData(from, to);
      }
    });
  }
  dateRangeFilter = signal<Date[]>([]);
  rows: BodyAnalysis[] = [];
  isLoading = false;

  ngOnInit(): void {}

  private convertToLocal(utc: Date) {
    return new Date(utc.getTime() + utc.getTimezoneOffset() + 1000);
  }

  private formatToSearchString(date: Date) {
    return format(date, `yyyy-MM-dd'T'HH:mm`);
  }

  async loadTableData(from: Date, to: Date) {
    this.isLoading = true;
    const fromLocalTime = this.convertToLocal(from);
    const toLocalTime = endOfDay(this.convertToLocal(to));

    const fromSearchString = this.formatToSearchString(fromLocalTime);
    const toLocalTimeAsSearchString = this.formatToSearchString(toLocalTime);

    let entitiesIterator = this.bodyAnalysisTable.listEntities({
      queryOptions: {
        filter: `PartitionKey eq 'body_data' and RowKey ge '${fromSearchString}' and RowKey le '${toLocalTimeAsSearchString}'`,
      },
    });
    let r: BodyAnalysis[] = [];

    for await (const entity of entitiesIterator) {
      r.push({
        analysedAt: new Date(entity.rowKey!),
        weight: entity['Weight'] as number,
        bmi: entity['Bmi'] as number,
        bodyFat: entity['BodyFat'] as number,
        bodyWater: entity['BodyWater'] as number,
        muscleMass: entity['MuscleMass'] as number,
        dailyCalorieRequirement: entity['DailyCalorieRequirement'] as number,
      });
    }

    this.rows = r;
    this.isLoading = false;
  }
}

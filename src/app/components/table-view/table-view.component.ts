import { CommonModule } from '@angular/common';
import { Component, signal, ViewEncapsulation } from '@angular/core';
import { TableClient, TableEntityResult } from '@azure/data-tables';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
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

  constructor(private bodyAnalysisTable: TableClient) {}

  private mapEntityToBodyAnalysis(
    entity: TableEntityResult<Record<string, unknown>>
  ): BodyAnalysis {
    return {
      analysedAt: new Date(entity.rowKey!),
      weight: entity['Weight'] as number,
      bmi: entity['Bmi'] as number,
      bodyFat: entity['BodyFat'] as number,
      bodyWater: entity['BodyWater'] as number,
      muscleMass: entity['MuscleMass'] as number,
      dailyCalorieRequirement: entity['DailyCalorieRequirement'] as number,
    };
  }

  private queryAzureTables(from: string, to: string) {
    return this.bodyAnalysisTable.listEntities({
      queryOptions: {
        filter: `PartitionKey eq 'body_data' and RowKey ge '${from}' and RowKey le '${to}'`,
      },
    });
  }

  onPreparedDateRangeChanged(event: string[]) {
    const [from, to] = event;
    console.log(event);
    this.loadTableData(from, to);
  }

  async loadTableData(from: string, to: string) {
    try {
      this.isLoading = true;

      let entitiesIterator = this.queryAzureTables(from, to);

      let result: BodyAnalysis[] = [];
      for await (const entity of entitiesIterator) {
        result.push(this.mapEntityToBodyAnalysis(entity));
      }

      this.rows = result;
    } catch (error) {
      this.rows = [];
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
}

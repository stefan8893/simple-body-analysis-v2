import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { TableClient, TableEntityResult } from '@azure/data-tables';
import { endOfDay, format } from 'date-fns';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { BodyAnalysis } from '../../body-analysis-data/body-analysis.types';
import {
  AzureTablesFilter,
  BodyAnalysisFilter,
} from '../../body-analysis-data/common.types';
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
  dateRangeFilter = signal<Date[]>([]);
  rows: BodyAnalysis[] = [];
  isLoading = false;
  isRefreshButtonEnabled = computed(
    () => this.dateRangeFilter()?.filter((x) => !!x).length === 2
  );

  constructor(private bodyAnalysisTable: TableClient) {
    effect(() => {
      const changed = this.dateRangeFilter();
      this.loadTableData();
    });
  }

  private convertToLocal(utc: Date) {
    return new Date(utc.getTime() + utc.getTimezoneOffset() + 1000);
  }

  private formatToSearchString(date: Date) {
    return format(date, `yyyy-MM-dd'T'HH:mm`);
  }

  private prepareAzureTablesFilter(): BodyAnalysisFilter {
    const [from, to] = this.dateRangeFilter() ?? [];
    if (!from || !to) {
      return { type: 'invalid', reason: `Missing 'from' or 'to' date.` };
    }

    const fromLocalTime = this.convertToLocal(from);
    const toLocalTime = endOfDay(this.convertToLocal(to));

    const fromSearchString = this.formatToSearchString(fromLocalTime);
    const toSearchString = this.formatToSearchString(toLocalTime);

    return {
      type: 'filter',
      from: fromSearchString,
      to: toSearchString,
    };
  }

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

  private queryAzureTables(filter: AzureTablesFilter) {
    return this.bodyAnalysisTable.listEntities({
      queryOptions: {
        filter: `PartitionKey eq 'body_data' and RowKey ge '${filter.from}' and RowKey le '${filter.to}'`,
      },
    });
  }

  async loadTableData() {
    const filter = this.prepareAzureTablesFilter();
    if (filter.type === 'invalid') {
      console.debug('Invalid Filter:', filter.reason);
      return;
    }

    try {
      this.isLoading = true;

      let entitiesIterator = this.queryAzureTables(filter);

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

  async refresh() {
    this.loadTableData();
  }
}

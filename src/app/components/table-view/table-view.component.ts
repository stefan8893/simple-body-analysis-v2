import { CommonModule } from '@angular/common';
import { Component, signal, ViewEncapsulation } from '@angular/core';
import { TableClient } from '@azure/data-tables';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { BodyAnalysisQueryService } from '../../body-analysis-data/body-analysis-query.service';
import { BodyAnalysis } from '../../body-analysis-data/body-analysis.types';
import { formatToRowKey } from '../../body-analysis-data/query-utils';
import { Resource } from '../../infrastructure/resource.state';
import { FormatDatePipe } from '../../pipes/date-fns-format.pipe';
import { ContentHeaderComponent } from '../miscellaneous/content-header/content-header.component';
import { DateRangePickerComponent } from '../miscellaneous/date-range-picker/date-range-picker.component';
import { LoadingSpinnerComponent } from '../miscellaneous/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-table-view',
  standalone: true,
  imports: [
    CommonModule,
    ContentHeaderComponent,
    DateRangePickerComponent,
    LoadingSpinnerComponent,
    ButtonModule,
    TableModule,
    CardModule,
    ConfirmDialogModule,
    ToastModule,
    FormatDatePipe,
  ],
  templateUrl: './table-view.component.html',
  styleUrl: './table-view.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TableViewComponent {
  dateRange = signal<string[]>([]);
  bodyAnalysisTableData: Resource<BodyAnalysis[]> = { state: 'loading' };

  constructor(
    private bodyAnalysisQueryService: BodyAnalysisQueryService,
    private bodyAnalysisTableClient: TableClient,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  onPreparedDateRangeChanged(event: string[]) {
    this.dateRange.set(event);
    const [from, to] = event;

    if (event.length === 0 && this.bodyAnalysisTableData.state === 'loaded') {
      this.bodyAnalysisTableData.value = [];
    } else {
      this.loadTableData(from, to);
    }
  }

  async loadTableData(from: string, to: string) {
    try {
      this.bodyAnalysisTableData = {
        state: 'loading',
      };

      const result = await this.bodyAnalysisQueryService.query(from, to);

      this.bodyAnalysisTableData = {
        state: 'loaded',
        value: result,
      };
    } catch (error) {
      this.bodyAnalysisTableData = {
        state: 'error',
        errorDetails: `${error}`,
      };
      console.error(error);
    }
  }

  async deleteEntry(event: Event, analysedAt: Date) {
    const analysedAtRowKey = formatToRowKey(analysedAt);

    const deleteInAzureTables = () => {
      return this.bodyAnalysisTableClient.deleteEntity(
        'body_data',
        analysedAtRowKey
      );
    };

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Eintrag vom ${format(analysedAt, 'Pp', {
        locale: de,
      })} löschen?`,
      header: 'Löschen',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: async () => {
        try {
          await deleteInAzureTables();
          this.bodyAnalysisQueryService.clearCache();
          this.onPreparedDateRangeChanged(this.dateRange());

          this.messageService.add({
            severity: 'success',
            summary: 'Eintrag gelöscht',
          });
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Oops!',
            detail: `${error}`,
          });
        }
      },
      reject: () => {},
    });
  }
}

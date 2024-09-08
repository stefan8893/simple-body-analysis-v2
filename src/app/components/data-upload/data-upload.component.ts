import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import { StepperModule } from 'primeng/stepper';
import { TableModule } from 'primeng/table';
import { BodyAnalysis } from '../../body-analysis-data/body-analysis.types';
import {
  parseBodyAnalysisCsv,
  ParsingResult,
} from '../../body-analysis-data/csv-parser';
import { FormatDatePipe } from '../../pipes/date-fns-format.pipe';
import { ContentHeaderComponent } from '../miscellaneous/content-header/content-header.component';

@Component({
  selector: 'app-data-upload',
  standalone: true,
  imports: [
    ContentHeaderComponent,
    CommonModule,
    StepperModule,
    FileUploadModule,
    ButtonModule,
    FormatDatePipe,
    TableModule,
    BadgeModule,
    CardModule,
  ],
  templateUrl: './data-upload.component.html',
  styleUrl: './data-upload.component.scss',
})
export class DataUploadComponent {
  files = signal<File[]>([]);

  parsedCsv: ParsingResult = { type: 'no-source-file' };

  bodyAnalysisRecordsToUpload: BodyAnalysis[] = [];

  totalSize: number = 0;

  totalSizePercent: number = 0;

  constructor(private config: PrimeNGConfig) {
    effect(async () => {
      const files = this.files();
      if (files.length > 0) {
        this.parsedCsv = await this.parseCsvFile(files[0]);
      } else {
        this.parsedCsv = { type: 'no-source-file' };
      }
    });
  }

  onRemoveTemplatingFile(
    event: any,
    file: File,
    removeFileCallback: (event: any, index: number) => void,
    index: number
  ) {
    removeFileCallback(event, index);
    this.totalSize -= parseInt(this.formatSize(file.size));
    this.totalSizePercent = this.totalSize / 10;
  }

  onSelectedFiles(event: any) {
    this.files.update(() => event.currentFiles);
    this.files().forEach((file) => {
      this.totalSize += parseInt(this.formatSize(file.size));
    });
    this.totalSizePercent = this.totalSize / 10;
  }

  formatSize(bytes: number) {
    const k = 1024;
    const dm = 2;
    const sizes = this.config.translation.fileSizeTypes!;
    if (bytes === 0) {
      return `0 ${sizes[0]}`;
    }

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${formattedSize.toLocaleString('de-AT')} ${sizes[i]}`;
  }

  async parseCsvFile(file: File): Promise<ParsingResult> {
    return parseBodyAnalysisCsv(file);
  }
}

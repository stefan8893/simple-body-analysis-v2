import { Injectable } from '@angular/core';
import { TableClient, TableEntity } from '@azure/data-tables';
import { compareAsc } from 'date-fns';
import { BodyAnalysisQueryService } from './body-analysis-query.service';
import { BodyAnalysis } from './body-analysis.types';
import { formatToRowKey } from './query-utils';

@Injectable({ providedIn: 'root' })
export class BodyAnalysisUploadService {
  constructor(
    private bodyAnalysisTable: TableClient,
    private queryService: BodyAnalysisQueryService
  ) {}

  async filterNewEntries(data: BodyAnalysis[]): Promise<BodyAnalysis[]> {
    if (data.length === 0) return [];

    const last = data[0];
    const first = data[data.length - 1];

    const existing = await this.queryService.query(
      formatToRowKey(first.analysedAt),
      formatToRowKey(last.analysedAt)
    );

    return data.filter(
      (x) => !existing.some((e) => compareAsc(x.analysedAt, e.analysedAt) === 0)
    );
  }

  async upload(data: BodyAnalysis[]): Promise<void> {
    const entities: TableEntity<object>[] = data.map((x) => ({
      partitionKey: 'body_data',
      rowKey: formatToRowKey(x.analysedAt),
      Weight: x.weight,
      MuscleMass: x.muscleMass,
      BodyWater: x.bodyWater,
      BodyFat: x.bodyFat,
      Bmi: x.bmi,
      DailyCalorieRequirement: x.dailyCalorieRequirement,
    }));

    for (const entity of entities) {
      await this.bodyAnalysisTable.createEntity(entity);
    }
  }
}

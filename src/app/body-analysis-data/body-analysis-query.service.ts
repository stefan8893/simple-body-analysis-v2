import { Injectable } from '@angular/core';
import { TableClient, TableEntityResult } from '@azure/data-tables';
import { compareAsc, endOfDay, parseISO, startOfDay } from 'date-fns';
import { BodyAnalysis } from './body-analysis.types';
import { sampleData } from './sample-data';

@Injectable({ providedIn: 'root' })
export class BodyAnalysisQueryService {
  private cache: BodyAnalysis[] = [];
  constructor(private bodyAnalysisTable: TableClient) {}

  private getBoundariesOfCachedData() {
    if (this.cache.length < 2) return null;

    const oldest = this.cache[0].analysedAt;
    const latest = this.cache[this.cache.length - 1].analysedAt;

    return {
      latest,
      oldest,
    };
  }

  private isInCacheRange(from: Date, to: Date) {
    const boundaries = this.getBoundariesOfCachedData();

    if (!boundaries) return false;

    return (
      from >= startOfDay(boundaries.oldest) && to <= endOfDay(boundaries.latest)
    );
  }

  private queryCache(from: Date, to: Date) {
    return this.cache.filter((x) => x.analysedAt >= from && x.analysedAt <= to);
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

  private async queryAzureTables(from: string, to: string) {
    const resultIterator = this.bodyAnalysisTable.listEntities({
      queryOptions: {
        filter: `PartitionKey eq 'body_data' and RowKey ge '${from}' and RowKey le '${to}'`,
      },
    });

    return (await Array.fromAsync(resultIterator)).map((x) =>
      this.mapEntityToBodyAnalysis(x)
    );
  }

  clearCache() {
    this.cache = [];
  }

  async query(from: string, to: string) {
    const fromAsDate = parseISO(from);
    const toAsDate = parseISO(to);

    if (this.isInCacheRange(fromAsDate, toAsDate))
      return this.queryCache(fromAsDate, toAsDate);

    const result = sampleData; //await this.queryAzureTables(from, to);
    const resultSorted = result.sort((a, b) =>
      compareAsc(a.analysedAt, b.analysedAt)
    );

    return (this.cache = resultSorted);
  }
}

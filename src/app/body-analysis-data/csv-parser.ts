import { parse } from 'date-fns';
import { de } from 'date-fns/locale';
import { BodyAnalysis, BodyAnalysisProperty } from './body-analysis.types';

export type NoSourceFileParsingResult = {
  type: 'no-source-file';
};

export type ErrorParsingResult = {
  type: 'error';
  reason: string;
};

export type SuccessParsingResult = {
  type: 'success';
  data: BodyAnalysis[];
};

export type ParsingResult =
  | NoSourceFileParsingResult
  | ErrorParsingResult
  | SuccessParsingResult;

const bodyAnalysisPropertyByCsvHeader = new Map<BodyAnalysisProperty, string>([
  ['weight', 'Gewicht'],
  ['bmi', 'BMI'],
  ['bodyFat', 'Körperfettanteil'],
  ['bodyWater', 'Wasser'],
  ['muscleMass', 'Muskelmasse'],
  ['dailyCalorieRequirement', 'Energie Tagesbedarf'],
]);

const delimiter = ';';

export async function parseBodyAnalysisCsv(file: File): Promise<ParsingResult> {
  const fileContent = await toString(file);
  const lines = fileContent.split('\n');

  const header = lines
    .map((x, i) => ({ value: x.split(delimiter), index: i }))
    .find(({ value, index }) => (isDataHeader(value) ? index : null));

  if (!header) {
    return {
      type: 'error',
      reason: 'Die Datei enthält keinen Header.',
    };
  }

  const dataRows = lines.slice(header.index + 1);
  const parsedDataRows = dataRows
    .map((x) => parseRow(header.value, x))
    .filter((x) => !!x);

  return {
    type: 'success',
    data: parsedDataRows,
  };
}

function parseRow(header: string[], row: string): BodyAnalysis | null {
  const cells = row.split(delimiter);

  if (cells.length !== header.length) return null;

  const indexOfProperty = (property: BodyAnalysisProperty) => {
    return header.indexOf(bodyAnalysisPropertyByCsvHeader.get(property) ?? '');
  };

  const analysedAtString = `${cells[header.indexOf('Datum')]} ${
    cells[header.indexOf('Uhrzeit')]
  }`;
  const analysedAt = parse(analysedAtString, 'Pp', new Date(), { locale: de });

  const weight = Number(cells[indexOfProperty('weight')]);
  const muscleMass = Number(cells[indexOfProperty('muscleMass')]);
  const bodyWater = Number(cells[indexOfProperty('bodyWater')]);
  const bodyFat = Number(cells[indexOfProperty('bodyFat')]);
  const bmi = Number(cells[indexOfProperty('bmi')]);
  const dailyCalorieRequirement = Number(
    cells[indexOfProperty('dailyCalorieRequirement')]
  );

  return {
    analysedAt,
    weight,
    muscleMass,
    bodyWater,
    bodyFat,
    bmi,
    dailyCalorieRequirement,
  };
}

function isDataHeader(cells: string[]): boolean {
  const containsHeaderFor = (bodyAnalysisProperty: BodyAnalysisProperty) =>
    cells.some(
      (x) => x === bodyAnalysisPropertyByCsvHeader.get(bodyAnalysisProperty)
    );

  return (
    cells.some((x) => x === 'Datum') &&
    cells.some((x) => x === 'Uhrzeit') &&
    containsHeaderFor('weight') &&
    containsHeaderFor('muscleMass') &&
    containsHeaderFor('bodyWater') &&
    containsHeaderFor('bodyFat') &&
    containsHeaderFor('bmi') &&
    containsHeaderFor('dailyCalorieRequirement')
  );
}

function toString(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

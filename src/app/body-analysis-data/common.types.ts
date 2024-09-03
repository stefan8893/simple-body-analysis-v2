export type AzureTablesFilter = {
  type: 'filter';
  from: string;
  to: string;
};

export type InvalidFilter = {
  type: 'invalid';
  reason: string;
};

export type BodyAnalysisFilter = AzureTablesFilter | InvalidFilter;

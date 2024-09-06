export type BodyAnalysisProperty =
  | 'weight'
  | 'muscleMass'
  | 'bodyWater'
  | 'bodyFat';

export type BodyAnalysis = {
  analysedAt: Date;
  weight: number;
  bmi: number;
  bodyFat: number;
  bodyWater: number;
  muscleMass: number;
  dailyCalorieRequirement: number;
};

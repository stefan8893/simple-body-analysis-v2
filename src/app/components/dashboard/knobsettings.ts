import {
  bodyFatColor,
  bodyWaterColor,
  muscleMassColor,
  weightColor,
} from '../body-analysis.colors';
import { KnobSettings } from '../dashboard-widget/dashboard-widget.component';

export const currentWeightKnobSettings: KnobSettings = {
  color: weightColor,
  unit: 'kg',
  min: 55,
  max: 80,
};

export const currentMuscleMassKnobSettings: KnobSettings = {
  color: muscleMassColor,
  unit: '%',
  min: 30,
  max: 55,
};

export const currentBodyWaterKnobSettings: KnobSettings = {
  color: bodyWaterColor,
  unit: '%',
  min: 50,
  max: 70,
};

export const currentBodyFatKnobSettings: KnobSettings = {
  color: bodyFatColor,
  unit: '%',
  min: 8,
  max: 22,
};

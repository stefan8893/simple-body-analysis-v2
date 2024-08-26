export type LengthUnit = 'px' | 'rem' | 'em' | '%' | 'vw' | 'vh';

export interface Length {
  value: number;
  unit: LengthUnit;
}

// if you wanna change this value, please do it in _layout-variables.scss as well.
export const layouVariables = {
  mobileBreakpoint: {
    value: 576,
    unit: 'px',
  } as Length,
};

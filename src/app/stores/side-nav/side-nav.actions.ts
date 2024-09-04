import { createAction, props } from '@ngrx/store';

export const setVisibility = createAction(
  '[Side Nav] Set Visibility',
  props<{ isVisible: boolean }>()
);

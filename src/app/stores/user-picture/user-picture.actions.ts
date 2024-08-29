import { createAction, props } from '@ngrx/store';
import { PictureSource } from './user-picture.reducer';

export const setPicture = createAction(
  '[User Picture] Set',
  props<{ objectUrl: string; source: PictureSource }>()
);
export const removePicture = createAction('[User Picture] Remove');

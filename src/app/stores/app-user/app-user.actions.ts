import { createAction, props } from '@ngrx/store';
import { IdToken } from '../../auth/auth.functions';

export type SetAppUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  pictureUrl: string;
};

export const setUser = createAction('[App User] Set', props<IdToken>());
export const removeUser = createAction('[App User] Remove');

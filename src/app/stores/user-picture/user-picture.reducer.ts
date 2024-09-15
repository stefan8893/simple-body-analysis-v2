import { createReducer, on } from '@ngrx/store';
import { removePicture, setPicture } from './user-picture.actions';

export type PictureSource = 'GraphApi' | 'Cache';

export type UserPicture = {
  objectUrl: string;
  source: PictureSource;
};

export type UserPictureState = UserPicture | null;

export const initialState: UserPictureState = null as UserPictureState;

export const userPictureReducer = createReducer(
  initialState,
  on(setPicture, (_state, picture) => ({
    objectUrl: picture.objectUrl,
    source: picture.source,
  })),
  on(removePicture, () => null)
);

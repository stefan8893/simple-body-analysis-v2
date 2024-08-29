import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { UserProfileService } from '../../auth/user-profile.service';
import { removeUser, setUser } from './app-user.actions';
import { exhaustMap, map, catchError, of, EMPTY, filter } from 'rxjs';
import { setPicture } from '../user-picture/user-picture.actions';
import { EffectError } from '../common.types';

export const loadUserPicture = createEffect(
  (
    actions$ = inject(Actions),
    userProfileService = inject(UserProfileService)
  ) => {
    return actions$.pipe(
      ofType(setUser),
      exhaustMap((idToken) =>
        userProfileService.loadUserPicture(<string>idToken['sub']).pipe(
          map((response) => setPicture({ ...response })),
          catchError((error: EffectError) => {
            console.error(error);
            return EMPTY;
          })
        )
      )
    );
  },
  { functional: true }
);

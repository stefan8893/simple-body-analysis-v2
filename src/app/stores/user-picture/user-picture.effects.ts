import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { UserProfileService } from '../../auth/user-profile.service';
import { exhaustMap, map } from 'rxjs';
import { removePicture } from '../user-picture/user-picture.actions';
import { removeUser } from '../app-user/app-user.actions';

export const removeUserPicture = createEffect(
  (
    actions$ = inject(Actions),
    userProfileService = inject(UserProfileService)
  ) => {
    return actions$.pipe(
      ofType(removeUser, removePicture),
      exhaustMap(() => userProfileService.clearUserPictureCache())
    );
  },
  { functional: true, dispatch: false }
);

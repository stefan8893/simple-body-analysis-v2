import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { select } from '@ngrx/store';
import {
  catchError,
  concatMap,
  EMPTY,
  firstValueFrom,
  from,
  map,
  of,
  tap,
} from 'rxjs';
import { PictureSource } from '../stores/user-picture/user-picture.reducer';
import {
  USER_PICTURE_STORAGE,
  UserPictureStorage,
} from './user-picture-storage.service';

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  pictureUrl: string;
};

type UserInfoDto = {
  sub: string;
  name: string;
  family_name: string;
  given_name: string;
  picture: string | null;
  email: string | null;
};

type UserPicture = {
  objectUrl: string;
  source: PictureSource;
};

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  static readonly userInfoEndpoint = new URL(
    'https://graph.microsoft.com/oidc/userinfo'
  );

  static readonly scopes = ['email', 'openid', 'profile', 'user.read'];

  constructor(
    private httpClient: HttpClient,
    @Inject(USER_PICTURE_STORAGE)
    private userPictureStorage: UserPictureStorage,
    private authService: MsalService
  ) {}

  private async ensureValidAccessToken(): Promise<void> {
    await firstValueFrom(
      this.authService
        .acquireTokenSilent({
          account: this.authService.instance.getActiveAccount() ?? undefined,
          scopes: UserProfileService.scopes,
        })
        .pipe(
          catchError(() => {
            this.authService.acquireTokenRedirect({
              scopes: UserProfileService.scopes,
            });

            throw 'This path will never be reached.';
          })
        )
    );
  }

  loadUserProfile() {
    const loadUserProfile = () => {
      return this.httpClient
        .get<UserInfoDto>(UserProfileService.userInfoEndpoint.href)
        .pipe(
          tap((x) => console.debug('UserProfile:', x)),
          select((x) => ({
            id: x.sub,
            firstName: x.given_name,
            lastName: x.family_name,
            email: x.email ?? '',
            pictureUrl: x.picture ?? '',
          })),
          catchError((error: HttpErrorResponse) => {
            console.error('Error while loading user profile', error);
            throw { message: error.message };
          })
        );
    };

    // this ensures that the app holds a valid access token
    this.ensureValidAccessToken();

    // finally the msal interceptor adds the token to the request
    return loadUserProfile();
  }

  loadUserPicture(userId: string) {
    const cachedPicture = from(this.userPictureStorage.get(userId));

    const grahPicture = this.loadUserProfile().pipe(
      concatMap((x) => this.loadPictureFromGraphApi(x.pictureUrl)),
      tap((x) => this.userPictureStorage.set(userId, x.objectUrl))
    );

    return cachedPicture.pipe(
      concatMap((cached) => (!!cached ? of(cached) : grahPicture))
    );
  }

  private loadPictureFromGraphApi(pictureUrl: string) {
    return this.httpClient
      .get<Blob>(pictureUrl, {
        observe: 'body',
        responseType: 'blob' as 'json',
      })
      .pipe(
        map(
          (picture): UserPicture => ({
            objectUrl: URL.createObjectURL(picture),
            source: 'GraphApi',
          })
        ),
        tap((x) => console.debug('User Picture loaded:', x)),
        catchError((error: HttpErrorResponse) => {
          console.error('Error while loading user picture', error);
          throw { message: error.message };
        })
      );
  }

  clearUserPictureCache() {
    console.log('Remove user picture from storage.');
    this.userPictureStorage.clear();

    return EMPTY;
  }
}

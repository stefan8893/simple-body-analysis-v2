import { APP_INITIALIZER, ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  msalGuardConfigFactory,
  msalInstanceFactory,
  msalInterceptorConfigFactory,
} from './auth/auth-config';
import {
  MsalInterceptor,
  MSAL_INSTANCE,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalService,
  MsalGuard,
  MsalBroadcastService,
} from '@azure/msal-angular';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideStore, Store } from '@ngrx/store';
import {
  appUserReducer,
  AppUserState,
} from './stores/app-user/app-user.reducer';
import { UserProfileService } from './auth/user-profile.service';
import { provideEffects } from '@ngrx/effects';
import { userPictureReducer } from './stores/user-picture/user-picture.reducer';
import * as userPictureEffects from './stores/user-picture/user-picture.effects';
import {
  USER_PICTURE_STORAGE,
  useUserPictureStorage,
} from './auth/user-picture-storage.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideStore({
      appUser: appUserReducer,
      userPicture: userPictureReducer,
    }),
    provideEffects(userPictureEffects),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
      connectInZone: true,
    }),
    provideHttpClient(),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: msalInstanceFactory,
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: msalGuardConfigFactory,
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: msalInterceptorConfigFactory,
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    UserProfileService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [MsalService],
      multi: true,
    },
    {
      provide: USER_PICTURE_STORAGE,
      useFactory: useUserPictureStorage,
    },
  ],
};

function initializeApp(authService: MsalService) {
  return async () => {
    await initializeAuthentication(authService);
  };
}

async function initializeAuthentication(authService: MsalService) {
  await authService.instance.initialize();
  await authService.instance.handleRedirectPromise().catch(console.error);
}

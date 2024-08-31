import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, isDevMode } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalBroadcastService,
  MsalGuard,
  MsalInterceptor,
  MsalService,
} from '@azure/msal-angular';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import {
  msalGuardConfigFactory,
  msalInstanceFactory,
  msalInterceptorConfigFactory,
} from './auth/auth-config';
import {
  USER_PICTURE_STORAGE,
  useUserPictureStorage,
} from './auth/user-picture-storage.service';
import { UserProfileService } from './auth/user-profile.service';
import { appUserReducer } from './stores/app-user/app-user.reducer';
import * as userPictureEffects from './stores/user-picture/user-picture.effects';
import { userPictureReducer } from './stores/user-picture/user-picture.reducer';

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

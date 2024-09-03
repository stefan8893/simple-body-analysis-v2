import { registerLocaleData } from '@angular/common';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import localeDeAT from '@angular/common/locales/de-AT';
import localeDeAtExtra from '@angular/common/locales/extra/de-AT';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  isDevMode,
  LOCALE_ID,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { TableClient } from '@azure/data-tables';
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
import { BodyAnalysisQueryService } from './body-analysis-data/body-analysis-query.service';
import { useBodyAnalysisTableClient } from './body-analysis-data/use-body-analysis-table-client';
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
    BodyAnalysisQueryService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [MsalService],
      multi: true,
    },
    {
      provide: LOCALE_ID,
      useValue: 'de-AT',
    },
    {
      provide: USER_PICTURE_STORAGE,
      useFactory: useUserPictureStorage,
    },
    {
      provide: TableClient,
      useFactory: useBodyAnalysisTableClient,
      deps: [MsalService],
    },
  ],
};

function initializeApp(authService: MsalService) {
  return async () => {
    await initializeAuthentication(authService);
    initializeLocale();
  };
}

async function initializeAuthentication(authService: MsalService) {
  await authService.instance.initialize();
  await authService.instance.handleRedirectPromise().catch(console.error);
}

function initializeLocale() {
  registerLocaleData(localeDeAT, 'de-AT', localeDeAtExtra);
}

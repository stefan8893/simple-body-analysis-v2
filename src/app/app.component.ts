import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { EventType } from '@azure/msal-browser';
import { Store } from '@ngrx/store';
import { PrimeNGConfig } from 'primeng/api';
import { filter, Subject, takeUntil } from 'rxjs';
import { getIdToken, IdToken, isAuthenticated } from './auth/auth.functions';
import {
  USER_PICTURE_STORAGE,
  UserPictureStorage,
} from './auth/user-picture-storage.service';
import { LayoutComponent } from './components/layout/layout/layout.component';
import { removeUser, setUser } from './stores/app-user/app-user.actions';
import { AppUserState } from './stores/app-user/app-user.reducer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  private poisonPill$ = new Subject<void>();

  constructor(
    private primengConfig: PrimeNGConfig,
    private authService: MsalService,
    private authBroadcastService: MsalBroadcastService,
    private appUserStore: Store<{ appUser: AppUserState }>,
    @Inject(USER_PICTURE_STORAGE)
    private userPictureStorage: UserPictureStorage
  ) {
    this.primengConfig.ripple = true;
  }

  async ngOnInit(): Promise<void> {
    this.authBroadcastService.msalSubject$
      .pipe(
        filter((x) => x.eventType === EventType.LOGOUT_SUCCESS),
        takeUntil(this.poisonPill$)
      )
      .subscribe(() => {
        this.userPictureStorage.clear();
        console.debug('User Picture Storage cleared.');
      });

    if (isAuthenticated(this.authService)) {
      console.log('User is authenticated.');

      const idToken = getIdToken(this.authService);
      if (!idToken)
        throw 'User is authenticated, but has no Id-Token. This should really not gonna happen.';

      await this.onAuthenticated(idToken);
    } else {
      console.log('User is not authenticated.');
      this.onAuthenticationChallenge(this.appUserStore);
    }
  }

  async onAuthenticated(idToken: IdToken): Promise<void> {
    console.log('User is authenticated.');

    this.appUserStore.dispatch(setUser(idToken));
  }

  onAuthenticationChallenge(appUserStore: Store<{ appUser: AppUserState }>) {
    console.log('User is not authenticated.');
    console.debug('Remove possible existing user from store.');
    appUserStore.dispatch(removeUser());
  }

  ngOnDestroy(): void {
    this.poisonPill$.next();
    this.poisonPill$.complete();
  }
}

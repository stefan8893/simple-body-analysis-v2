import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AppUserState } from '../../stores/app-user/app-user.reducer';
import { UserPictureState } from '../../stores/user-picture/user-picture.reducer';
import { ContentHeaderComponent } from '../miscellaneous/content-header/content-header.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ContentHeaderComponent,
    FormsModule,
    InputTextModule,
    ButtonModule,
    AvatarModule,
    CardModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ProfileComponent implements OnDestroy {
  private poisonPill$ = new Subject<void>();

  appUser$: Observable<AppUserState>;
  userPicture$: Observable<UserPictureState>;
  value: string | undefined;

  userPictureObjectUrl = '';

  constructor(
    appUserStore: Store<{
      userPicture: UserPictureState;
      appUser: AppUserState;
    }>
  ) {
    this.appUser$ = appUserStore.select('appUser');
    this.userPicture$ = appUserStore.select('userPicture');

    this.userPicture$
      .pipe(takeUntil(this.poisonPill$))
      .subscribe((x) => (this.userPictureObjectUrl = x?.objectUrl ?? ''));
  }
  ngOnDestroy(): void {
    this.poisonPill$.next();
    this.poisonPill$.complete();
  }
}

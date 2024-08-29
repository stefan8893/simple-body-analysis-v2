import { Component, OnDestroy, output, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { NgIf } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { Store } from '@ngrx/store';
import { UserPictureState } from '../../../stores/user-picture/user-picture.reducer';
import { AppUserState } from '../../../stores/app-user/app-user.reducer';
import { Observable, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    AvatarModule,
    ButtonModule,
    DropdownModule,
    MenuModule,
    BadgeModule,
    NgIf,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnDestroy {
  menuTogglerClicked = output();
  appTitleClicked = output();

  appUser$: Observable<AppUserState>;
  userPicture$: Observable<UserPictureState>;
  private poisonPill$ = new Subject<void>();

  userPictureObjectUrl = '';

  constructor(
    private authService: MsalService,
    userStore: Store<{ userPicture: UserPictureState; appUser: AppUserState }>
  ) {
    this.appUser$ = userStore.select('appUser');
    this.userPicture$ = userStore.select('userPicture');

    this.userPicture$
      .pipe(takeUntil(this.poisonPill$))
      .subscribe((x) => (this.userPictureObjectUrl = x?.objectUrl ?? ''));
  }

  items: MenuItem[] = [
    {
      separator: true,
    },
    {
      label: 'Documents',
      items: [
        {
          label: 'New',
          icon: 'pi pi-plus',
          shortcut: '⌘+N',
        },
        {
          label: 'Search',
          icon: 'pi pi-search',
        },
      ],
    },
    {
      label: 'Profile',
      items: [
        {
          label: 'Settings',
          icon: 'pi pi-cog',
          shortcut: '⌘+O',
        },
        {
          label: 'Messages',
          icon: 'pi pi-inbox',
          badge: '2',
        },
        {
          label: 'Logout',
          icon: 'pi pi-sign-out',
          shortcut: '⌘+Q',
          command: () => {
            this.authService.instance.logout();
          },
        },
      ],
    },
    {
      separator: true,
    },
  ];

  ngOnDestroy(): void {
    this.poisonPill$.next();
    this.poisonPill$.complete();
  }
}

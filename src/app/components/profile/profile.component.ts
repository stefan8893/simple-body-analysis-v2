import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppUserState } from '../../stores/app-user/app-user.reducer';
import { Observable } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  appUser$: Observable<AppUserState>;
  value: string | undefined;

  constructor(appUserStore: Store<{ appUser: AppUserState }>) {
    this.appUser$ = appUserStore.select('appUser');
  }
}

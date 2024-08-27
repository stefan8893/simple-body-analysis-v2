import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  constructor(private authService: MsalService) {
    this.isLoggedIn = this.authService.instance.getAllAccounts().length > 0;
  }

  isLoggedIn: boolean = false;

  async login() {
    console.log('Login');
    await this.authService.instance.loginRedirect();
  }

  async logout() {
    console.log('Logout');
    await this.authService.instance.logoutRedirect();
  }
}

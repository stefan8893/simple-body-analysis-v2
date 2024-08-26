import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from '../header/header.component';
import { MessageService } from 'primeng/api';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { layouVariables } from '../../../../styles/layout-variables';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SideNavComponent,
    SidebarModule,
    ToastModule,
    ButtonModule,
  ],
  providers: [MessageService],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  showMobileMenu = false;
  showBrowserMenu = true;

  triggerMenu() {
    const isMobile = window.innerWidth < layouVariables.mobileBreakpoint.value;

    if (isMobile) {
      this.showMobileMenu = true;
    } else {
      this.showBrowserMenu = !this.showBrowserMenu;
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from '../header/header.component';
import { MessageService } from 'primeng/api';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { ButtonModule } from 'primeng/button';
import { layouVariables } from '../../../../styles/layout-variables';
import {
  calculateSideNavState,
  initialSideNavState,
  SideNavState,
  StateChangeTrigger,
} from './side-nav.state';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SideNavComponent,
    ToastModule,
    ButtonModule,
  ],
  providers: [MessageService],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit {
  private get isMobileView(): boolean {
    return window.innerWidth < layouVariables.mobileBreakpoint.value;
  }
  sideNavState: SideNavState = initialSideNavState(false);

  sideNavCssClassByState = new Map<string, string>([
    ['show', ''],
    ['hideAnimated', 'side-nav-closed'],
    ['hideInstantly', 'side-nav-closed-instantly'],
  ]);

  ngOnInit(): void {
    this.sideNavState = initialSideNavState(this.isMobileView);
  }

  updateSideNavState(trigger: StateChangeTrigger) {
    this.sideNavState = calculateSideNavState(
      this.sideNavState,
      trigger,
      this.isMobileView
    );
  }

  onMenuTogglerClicked() {
    this.updateSideNavState('MenuTogglerClicked');
  }

  menuItemSelected() {
    this.updateSideNavState('MenuItemSelected');
  }

  onOverlayClicked() {
    this.updateSideNavState('OverlayClicked');
  }

  onResize() {
    this.updateSideNavState('WindowResized');
  }
}

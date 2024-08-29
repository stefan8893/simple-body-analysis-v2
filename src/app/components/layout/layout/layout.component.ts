import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
import { fromEvent, Observable, Subject } from 'rxjs';
import { map, filter, debounceTime, tap, switchAll } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SideNavComponent, ButtonModule],
  providers: [MessageService],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  windowResize$: Observable<Event>;
  private get isMobileView(): boolean {
    return window.innerWidth < layouVariables.mobileBreakpoint.value;
  }
  sideNavState: SideNavState = initialSideNavState(false);

  sideNavCssClassByState = new Map<string, string>([
    ['show', ''],
    ['hideAnimated', 'side-nav-closed'],
    ['hideInstantly', 'side-nav-closed-instantly'],
    ['hideAnimatedAndSlowly', 'side-nav-closed-slowly'],
  ]);

  constructor() {
    this.sideNavState = initialSideNavState(this.isMobileView);

    this.windowResize$ = fromEvent(window, 'resize').pipe(debounceTime(50));
    this.windowResize$.subscribe(() =>
      this.updateSideNavState('WindowResized')
    );
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

  onAppTitleClicked() {
    this.updateSideNavState('AppTitleClicked');
  }
}

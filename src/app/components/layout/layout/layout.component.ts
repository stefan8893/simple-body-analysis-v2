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
  ViewType,
} from './side-nav.state';
import { fromEvent, Observable, Subject } from 'rxjs';
import { debounceTime, take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SideNavComponent, ButtonModule],
  providers: [MessageService],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit, OnDestroy {
  windowResize$: Observable<Event>;
  private get viewType(): ViewType {
    return window.innerWidth < layouVariables.mobileBreakpoint.value
      ? 'Mobile'
      : 'Browser';
  }
  private poisonPill$ = new Subject<void>();
  sideNavState: SideNavState = initialSideNavState('Browser');

  sideNavCssClassByState = new Map<string, string>([
    ['show', ''],
    ['hideInstantly', 'side-nav-closed-instantly'],
    ['hideAnimated', 'side-nav-closed-animated'],
    ['hideAnimatedAndSlowly', 'side-nav-closed-slowly-animated'],
  ]);

  constructor() {
    this.windowResize$ = fromEvent(window, 'resize');
  }
  ngOnInit(): void {
    this.sideNavState = initialSideNavState(this.viewType);

    this.windowResize$
      .pipe(debounceTime(50), takeUntil(this.poisonPill$))
      .subscribe(() => this.updateSideNavState('WindowResized'));
  }

  updateSideNavState(trigger: StateChangeTrigger) {
    this.sideNavState = calculateSideNavState(
      this.sideNavState,
      trigger,
      this.viewType
    );
  }

  onMenuTogglerClicked() {
    this.updateSideNavState('MenuTogglerClicked');
  }

  onMenuItemSelected() {
    this.updateSideNavState('MenuItemSelected');
  }

  onOverlayClicked() {
    this.updateSideNavState('OverlayClicked');
  }

  onAppTitleClicked() {
    this.updateSideNavState('AppTitleClicked');
  }

  ngOnDestroy(): void {
    this.poisonPill$.next();
    this.poisonPill$.complete();
  }
}

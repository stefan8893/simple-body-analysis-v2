import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { fromEvent, Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { layouVariables } from '../../../../styles/layout-variables';
import { setVisibility } from '../../../stores/side-nav/side-nav.actions';
import { HeaderComponent } from '../header/header.component';
import { SideNavComponent } from '../side-nav/side-nav.component';
import {
  calculateSideNavState,
  initialSideNavState,
  SideNavState,
  StateChangeTrigger,
  ViewType,
} from './side-nav.state';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SideNavComponent, ButtonModule],
  providers: [MessageService],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit, OnDestroy {
  private windowResize$: Observable<Event>;
  private poisonPill$ = new Subject<void>();
  private get viewType(): ViewType {
    return window.innerWidth < layouVariables.mobileBreakpoint.value
      ? 'Mobile'
      : 'Browser';
  }
  sideNavState: SideNavState = initialSideNavState('Browser');

  sideNavCssClassByState = new Map<string, string>([
    ['show', ''],
    ['hideInstantly', 'side-nav-closed-instantly'],
    ['hideAnimated', 'side-nav-closed-animated'],
    ['hideAnimatedAndSlowly', 'side-nav-closed-slowly-animated'],
  ]);

  sideNavCloseDelayInMillisecondsByState = new Map<string, number>([
    ['show', 0],
    ['hideInstantly', 0],
    ['hideAnimated', 300],
    ['hideAnimatedAndSlowly', 1000],
  ]);

  constructor(private sideNavStore: Store<{ sideNav: SideNavState }>) {
    this.windowResize$ = fromEvent(window, 'resize');
  }
  ngOnInit(): void {
    this.sideNavState = initialSideNavState(this.viewType);

    this.windowResize$
      .pipe(debounceTime(50), takeUntil(this.poisonPill$))
      .subscribe(() => this.updateSideNavState('WindowResized'));

    this.sideNavStore.dispatch(
      setVisibility({ isVisible: this.sideNavState.state === 'show' })
    );
  }

  updateSideNavState(trigger: StateChangeTrigger) {
    this.sideNavState = calculateSideNavState(
      this.sideNavState,
      trigger,
      this.viewType
    );

    const delay = this.sideNavCloseDelayInMillisecondsByState.get(
      this.sideNavState.state
    );

    setTimeout(() => {
      this.sideNavStore.dispatch(
        setVisibility({ isVisible: this.sideNavState.state === 'show' })
      );
    }, delay);
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

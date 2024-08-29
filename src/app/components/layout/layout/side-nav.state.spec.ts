import {
  calculateSideNavState,
  initialSideNavState,
  SideNavState,
} from './side-nav.state';

describe('LayoutComponent SideNav', () => {
  it('should not show up if loaded on a mobile view', () => {
    const initialState = initialSideNavState('Mobile');

    expect(initialState.showOverlay).toBeFalse();
    expect(initialState.state).toBe('hideInstantly');
  });

  it('should show up if loaded on browser view', () => {
    const initialState = initialSideNavState('Browser');

    expect(initialState.showOverlay).toBeFalse();
    expect(initialState.state).toBe('show');
  });

  it('should be hidden if menu gets toggled on browser view where it is currently displayed', () => {
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'MenuTogglerClicked',
      'Browser'
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('hideAnimated');
  });

  it('should be hidden if menu gets toggled on browser view where it is currently not displayed', () => {
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'hideAnimated',
    };

    const result = calculateSideNavState(
      currentState,
      'MenuTogglerClicked',
      'Browser'
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('show');
  });

  it('should be hidden if menu item gets selected on browser view', () => {
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'MenuItemSelected',
      'Browser'
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('show');
  });

  it('should be hidden if menu item gets selected on browser view even if the current state of show is false', () => {
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'hideAnimated',
    };

    const result = calculateSideNavState(
      currentState,
      'MenuItemSelected',
      'Browser'
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('show');
  });

  it('should keep its state if overlay click gets triggered, however this happened', () => {
    const currentState: SideNavState = {
      showOverlay: true,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'OverlayClicked',
      'Browser'
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('show');
  });

  it('should keep showing up if view switches from mobile to browser view and it was already shwown on mobile view', () => {
    const currentState: SideNavState = {
      showOverlay: true,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'WindowResized',
      'Browser'
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('show');
  });

  it('should be hidden slowly if view switches from browser to mobile view', () => {
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'WindowResized',
      'Mobile'
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('hideAnimatedAndSlowly');
  });

  it('should show up if menu toggler gets triggered on mobile view', () => {
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'hideAnimated',
    };

    const result = calculateSideNavState(
      currentState,
      'MenuTogglerClicked',
      'Mobile'
    );

    expect(result.showOverlay).toBeTrue();
    expect(result.state).toBe('show');
  });

  it('should be hidden animated if menu toggler gets triggered on mobile view and the side bar is currently shown', () => {
    const currentState: SideNavState = {
      showOverlay: true,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'MenuTogglerClicked',
      'Mobile'
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('hideAnimated');
  });

  it('should be hidden animated if overlay gets clicked on mobile view and the side bar is currently shown', () => {
    const currentState: SideNavState = {
      showOverlay: true,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'OverlayClicked',
      'Mobile'
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('hideAnimated');
  });

  it('should be hidden animated if menu item gets clicked on mobile view', () => {
    const currentState: SideNavState = {
      showOverlay: true,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'MenuItemSelected',
      'Mobile'
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('hideAnimated');
  });

  it('should keep showing up if view switches from mobile to browser view and side bar is currently shown', () => {
    const currentState: SideNavState = {
      showOverlay: true,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'WindowResized',
      'Browser'
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('show');
  });

  it('should be hidden if view switches from mobile to browser view and side bar is currently not shown', () => {
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'hideInstantly',
    };

    const result = calculateSideNavState(
      currentState,
      'WindowResized',
      'Browser'
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('hideInstantly');
  });

  it('should be hidden if app title gets clicked on mobile view and side bar is currently shown', () => {
    const currentState: SideNavState = {
      showOverlay: true,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'AppTitleClicked',
      'Mobile'
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('hideAnimated');
  });

  it('should keep showing up if app title gets clicked on browser view and side bar is currently shown', () => {
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'AppTitleClicked',
      'Browser'
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('show');
  });

  it('should be hidden (keeping its state) if app title gets clicked on browser view and side bar is currently not shown', () => {
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'hideAnimated',
    };

    const result = calculateSideNavState(
      currentState,
      'AppTitleClicked',
      'Browser'
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('hideAnimated');
  });

  it('should change nothing if overlay gets clicked on browser view and side bar is currently not shown', () => {
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'hideAnimated',
    };

    const result = calculateSideNavState(
      currentState,
      'OverlayClicked',
      'Browser'
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('hideAnimated');
  });

  it('should change nothing if overlay gets clicked on browser view and side bar is currently shown', () => {
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'OverlayClicked',
      'Browser'
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('show');
  });
});

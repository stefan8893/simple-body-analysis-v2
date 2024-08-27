import {
  calculateSideNavState,
  initialSideNavState,
  SideNavState,
} from './side-nav.state';

describe('LayoutComponent SideNav', () => {
  it('should not show up if loaded on a mobile view', () => {
    const isMobile = true;
    const initialState = initialSideNavState(isMobile);

    expect(initialState.showOverlay).toBeFalse();
    expect(initialState.state).toBe('hideInstantly');
  });

  it('should show up if loaded on browser view', () => {
    const isMobile = false;
    const initialState = initialSideNavState(isMobile);

    expect(initialState.showOverlay).toBeFalse();
    expect(initialState.state).toBe('show');
  });

  it('should be hidden if menu gets toggled on browser view where it is currently displayed', () => {
    const isMobile = false;
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'MenuTogglerClicked',
      isMobile
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('hideAnimated');
  });

  it('should be hidden if menu gets toggled on browser view where it is currently not displayed', () => {
    const isMobile = false;
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'hideAnimated',
    };

    const result = calculateSideNavState(
      currentState,
      'MenuTogglerClicked',
      isMobile
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('show');
  });

  it('should be hidden if menu item gets selected on browser view', () => {
    const isMobile = false;
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'MenuItemSelected',
      isMobile
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('show');
  });

  it('should be hidden if menu item gets selected on browser view even if the current state of show is false', () => {
    const isMobile = false;
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'hideAnimated',
    };

    const result = calculateSideNavState(
      currentState,
      'MenuItemSelected',
      isMobile
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('show');
  });

  it('should keep its state if overlay click gets triggered, however this happened', () => {
    const isMobile = false;
    const currentState: SideNavState = {
      showOverlay: true,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'OverlayClicked',
      isMobile
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('show');
  });

  it('should keep showing up if view switches from mobile to browser view and it was already shwown on mobile view', () => {
    const isMobile = false;
    const currentState: SideNavState = {
      showOverlay: true,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'WindowResized',
      isMobile
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('show');
  });

  it('should be hidden instantly if view switches from browser to mobile view', () => {
    const isMobile = true;
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'WindowResized',
      isMobile
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('hideInstantly');
  });

  it('should be hidden instantly if view switches from browser to mobile view even current state of show is false', () => {
    const isMobile = true;
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'hideAnimated',
    };

    const result = calculateSideNavState(
      currentState,
      'WindowResized',
      isMobile
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('hideInstantly');
  });

  it('should show up if menu toggler gets triggered on mobile view', () => {
    const isMobile = true;
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'hideAnimated',
    };

    const result = calculateSideNavState(
      currentState,
      'MenuTogglerClicked',
      isMobile
    );

    expect(result.showOverlay).toBeTrue();
    expect(result.state).toBe('show');
  });

  it('should be hidden animated if menu toggler gets triggered on mobile view and the side bar is currently shown', () => {
    const isMobile = true;
    const currentState: SideNavState = {
      showOverlay: true,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'MenuTogglerClicked',
      isMobile
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('hideAnimated');
  });

  it('should be hidden animated if overlay gets clicked on mobile view and the side bar is currently shown', () => {
    const isMobile = true;
    const currentState: SideNavState = {
      showOverlay: true,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'OverlayClicked',
      isMobile
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('hideAnimated');
  });

  it('should be hidden animated if menu item gets clicked on mobile view', () => {
    const isMobile = true;
    const currentState: SideNavState = {
      showOverlay: true,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'MenuItemSelected',
      isMobile
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('hideAnimated');
  });

  it('should keep showing up if view switches from mobile to browser view and side bar is currently shown', () => {
    const isMobile = false;
    const currentState: SideNavState = {
      showOverlay: true,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'WindowResized',
      isMobile
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('show');
  });

  it('should be hidden if view switches from mobile to browser view and side bar is currently not shown', () => {
    const isMobile = false;
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'hideInstantly',
    };

    const result = calculateSideNavState(
      currentState,
      'WindowResized',
      isMobile
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('hideInstantly');
  });

  it('should be hidden if app title gets clicked on mobile view and side bar is currently shown', () => {
    const isMobile = true;
    const currentState: SideNavState = {
      showOverlay: true,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'AppTitleClicked',
      isMobile
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('hideAnimated');
  });

  it('should keep showing up if app title gets clicked on browser view and side bar is currently shown', () => {
    const isMobile = false;
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'AppTitleClicked',
      isMobile
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('show');
  });

  it('should be hidden (keeping its state) if app title gets clicked on browser view and side bar is currently not shown', () => {
    const isMobile = false;
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'hideAnimated',
    };

    const result = calculateSideNavState(
      currentState,
      'AppTitleClicked',
      isMobile
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('hideAnimated');
  });

  it('should change nothing if overlay gets clicked on browser view and side bar is currently not shown', () => {
    const isMobile = false;
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'hideAnimated',
    };

    const result = calculateSideNavState(
      currentState,
      'OverlayClicked',
      isMobile
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('hideAnimated');
  });

  it('should change nothing if overlay gets clicked on browser view and side bar is currently shown', () => {
    const isMobile = false;
    const currentState: SideNavState = {
      showOverlay: false,
      state: 'show',
    };

    const result = calculateSideNavState(
      currentState,
      'OverlayClicked',
      isMobile
    );

    expect(result.showOverlay).toBeFalse();
    expect(result.state).toBe('show');
  });
});

export type SideNavState = {
  showOverlay: boolean;
  state: 'show' | 'hideAnimatedAndSlowly' | 'hideAnimated' | 'hideInstantly';
};

export type StateChangeTrigger =
  | 'MenuTogglerClicked'
  | 'AppTitleClicked'
  | 'MenuItemSelected'
  | 'WindowResized'
  | 'OverlayClicked';

export type ViewType = 'Mobile' | 'Browser';

export function initialSideNavState(viewType: ViewType): SideNavState {
  return viewType === 'Mobile'
    ? {
        showOverlay: false,
        state: 'hideInstantly',
      }
    : { showOverlay: false, state: 'show' };
}

export function calculateSideNavState(
  currentState: SideNavState,
  trigger: StateChangeTrigger,
  viewType: ViewType
): SideNavState {
  if (viewType === 'Mobile') {
    return calculateSideNavStateOnMobileView(currentState, trigger);
  } else {
    return calculateSideNavStateOnBrowserView(currentState, trigger);
  }
}
function calculateSideNavStateOnMobileView(
  currentState: SideNavState,
  trigger: StateChangeTrigger
): SideNavState {
  switch (trigger) {
    case 'OverlayClicked':
    case 'MenuItemSelected':
    case 'AppTitleClicked':
      return { showOverlay: false, state: 'hideAnimated' };
    case 'WindowResized':
      return { showOverlay: false, state: 'hideAnimatedAndSlowly' };
    case 'MenuTogglerClicked':
      const isCurrentlyShown = currentState.state === 'show';
      return {
        showOverlay: !isCurrentlyShown,
        state: isCurrentlyShown ? 'hideAnimated' : 'show',
      };
    default:
      return {
        showOverlay: false,
        state: 'hideInstantly',
      };
  }
}

function calculateSideNavStateOnBrowserView(
  currentState: SideNavState,
  trigger: StateChangeTrigger
): SideNavState {
  switch (trigger) {
    case 'MenuTogglerClicked': {
      const isCurrentlyShown = currentState.state === 'show';
      return {
        showOverlay: false,
        state: isCurrentlyShown ? 'hideAnimated' : 'show',
      };
    }
    case 'WindowResized': {
      const isCurrentlyShown = currentState.state === 'show';
      return {
        showOverlay: false,
        state: isCurrentlyShown ? 'show' : 'hideInstantly',
      };
    }
    case 'OverlayClicked': {
      return { showOverlay: false, state: currentState.state };
    }
    case 'AppTitleClicked': {
      return currentState;
    }
    default:
      return { showOverlay: false, state: 'show' };
  }
}

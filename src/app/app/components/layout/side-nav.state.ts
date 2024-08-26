export type SideNavState = {
  showOverlay: boolean;
  state: 'show' | 'hideAnimated' | 'hideInstantly';
};

export type StateChangeTrigger =
  | 'MenuTogglerClicked'
  | 'MenuItemSelected'
  | 'WindowResized'
  | 'OverlayClicked';

export function initialSideNavState(isMobileView: boolean): SideNavState {
  return isMobileView
    ? {
        showOverlay: false,
        state: 'hideInstantly',
      }
    : { showOverlay: false, state: 'show' };
}

export function calculateSideNavState(
  currentState: SideNavState,
  trigger: StateChangeTrigger,
  isMobileView: boolean
): SideNavState {
  if (isMobileView) {
    return calculateSideNavStateOnMovileView(currentState, trigger);
  } else {
    return calculateSideNavStateOnBrowserView(currentState, trigger);
  }
}
function calculateSideNavStateOnMovileView(
  currentState: SideNavState,
  trigger: StateChangeTrigger
): SideNavState {
  if (trigger === 'WindowResized') {
    return {
      showOverlay: false,
      state: 'hideInstantly',
    };
  } else if (trigger === 'MenuTogglerClicked') {
    const isCurrentlyShown = currentState.state === 'show';
    return {
      showOverlay: !isCurrentlyShown,
      state: !isCurrentlyShown ? 'show' : 'hideAnimated',
    };
  } else if (trigger === 'OverlayClicked') {
    return {
      showOverlay: false,
      state: 'hideAnimated',
    };
  } else {
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
  if (trigger === 'MenuTogglerClicked') {
    const isCurrentlyShown = currentState.state === 'show';

    return {
      showOverlay: false,
      state: isCurrentlyShown ? 'hideAnimated' : 'show',
    };
  } else if (trigger === 'WindowResized') {
    const isCurrentlyShown = currentState.state === 'show';

    return {
      showOverlay: false,
      state: isCurrentlyShown ? 'show' : 'hideInstantly',
    };
  } else {
    return { showOverlay: false, state: 'show' };
  }
}

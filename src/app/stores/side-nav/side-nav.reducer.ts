import { createReducer, on } from '@ngrx/store';
import { setVisibility } from './side-nav.actions';

export type SideNavState = {
  isVisible: boolean | null;
};

export const initialState: SideNavState = {
  isVisible: null,
};

export const sideNavReducer = createReducer(
  initialState,
  on(setVisibility, (_state, x) => ({ isVisible: x.isVisible }))
);

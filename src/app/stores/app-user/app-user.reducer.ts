import { createReducer, on } from '@ngrx/store';
import { removeUser, setUser } from './app-user.actions';
import { IdToken } from '../../auth/auth.functions';

export type AppUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type AppUserState = AppUser | null;

export const initialState: AppUserState = null as AppUserState;

export const appUserReducer = createReducer(
  initialState,
  on(setUser, (_state, idToken) => extractUser(idToken)),
  on(removeUser, () => null)
);

function extractUser(idToken: IdToken): AppUser {
  const userId = idToken['sub'] as string;
  const firstName = (idToken['name'] as string).split(' ')[0] ?? '';
  const lastName = (idToken['name'] as string).split(' ')[1] ?? '';
  const email = (idToken['email'] ?? '') as string;

  return {
    id: userId,
    firstName: firstName,
    lastName: lastName,
    email: email,
  };
}

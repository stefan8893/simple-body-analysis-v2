import { MsalService } from '@azure/msal-angular';

export function isAuthenticated(authService: MsalService): boolean {
  return authService.instance.getAllAccounts().length > 0;
}

export type IdToken = { [key: string]: unknown };

export function getIdToken(
  authService: MsalService
): IdToken | undefined | null {
  return isAuthenticated(authService)
    ? authService.instance.getAllAccounts()[0].idTokenClaims
    : null;
}

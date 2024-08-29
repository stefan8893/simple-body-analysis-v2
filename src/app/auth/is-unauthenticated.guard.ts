import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { isAuthenticated } from './auth.functions';

export const isUnauthenticatedGuard: CanActivateFn = (route, state) => {
  const authService = inject(MsalService);
  const router = inject(Router);

  if (isAuthenticated(authService)) {
    router.navigate(['/app']);
    return false;
  }

  return true;
};

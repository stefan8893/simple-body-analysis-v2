import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

export const isUnauthenticatedGuard: CanActivateFn = (route, state) => {
  const authService = inject(MsalService);
  const router = inject(Router);

  const isAuthenticated = authService.instance.getAllAccounts().length > 0;

  if (isAuthenticated) {
    router.navigate(['/app']);
    return false;
  }

  return true;
};

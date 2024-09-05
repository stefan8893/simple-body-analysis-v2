import { TableClient } from '@azure/data-tables';
import { AccessToken, TokenCredential } from '@azure/identity';
import { MsalService } from '@azure/msal-angular';
import { firstValueFrom } from 'rxjs';

export function useBodyAnalysisTableClient(
  authService: MsalService
): TableClient {
  const storageAccountUrl = 'https://simplebodyanalysis.table.core.windows.net';
  const storageAccountTableName = 'BodyAnalysis';
  const scope = 'https://storage.azure.com/user_impersonation';

  const getToken = async () => {
    try {
      return await firstValueFrom(
        authService.acquireTokenSilent({
          scopes: [scope],
        })
      );
    } catch {
      await firstValueFrom(
        authService.acquireTokenRedirect({
          scopes: [scope],
        })
      );

      throw 'This path will never be reached.';
    }
  };

  const tokenAdapter: TokenCredential = {
    getToken: async (): Promise<AccessToken | null> => {
      const accessTokenResult = await getToken();

      return {
        token: accessTokenResult.accessToken,
        expiresOnTimestamp:
          accessTokenResult.expiresOn?.getTime() ?? Date.now() + 60 * 60 * 1000,
      };
    },
  };

  return new TableClient(
    storageAccountUrl,
    storageAccountTableName,
    tokenAdapter
  );
}

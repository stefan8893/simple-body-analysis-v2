import { TableClient } from '@azure/data-tables';
import { AccessToken, TokenCredential } from '@azure/identity';
import { MsalService } from '@azure/msal-angular';
import { formatDistanceToNowStrict } from 'date-fns';

export function useBodyAnalysisTableClient(
  authService: MsalService
): TableClient {
  const storageAccountUrl = 'https://simplebodyanalysis.table.core.windows.net';
  const storageAccountTableName = 'BodyAnalysis';
  const scope = 'https://storage.azure.com/user_impersonation';

  const getToken = async () => {
    const start = new Date();
    try {
      return await authService.instance
        .acquireTokenSilent({
          account: authService.instance.getAllAccounts()[0],
          scopes: [scope],
        })
        .then((r) => {
          const elapsedTime = formatDistanceToNowStrict(start);
          console.log(
            `'acquireTokenSilent' in 'use-body-analysis-table-client.ts' took:`,
            elapsedTime
          );

          console.log(`'acquireTokenSilent' result: `, r);

          return r;
        });
    } catch (error) {
      console.error(`'acquireTokenSilent' failed. error: `, error);
      console.log('redirecting user to identity provider.');

      await authService.instance.acquireTokenRedirect({
        scopes: [scope],
      });

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

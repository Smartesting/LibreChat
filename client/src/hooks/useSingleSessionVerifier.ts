import { useQuery } from '@tanstack/react-query';
import { dataService, QueryKeys, Time } from 'librechat-data-provider';
import { useToastContext } from '~/Providers';
import { NotificationSeverity } from '~/common';
import logger from '~/utils/logger';
import { useSmaLocalize } from '~/hooks/index';
import { AxiosError } from 'axios';

export default function useSingleSessionVerifier(logout: () => void) {
  const { showToast } = useToastContext();
  const smaLocalize = useSmaLocalize();

  function showToastAndLogout(message) {
    showToast({
      message,
      severity: NotificationSeverity.WARNING,
      duration: 10000,
    });
    setTimeout(logout, 8000);
  }

  useQuery(
    [QueryKeys.session],
    async () => {
      try {
        const session = await dataService.getUserSession();
        if (!session) {
          showToastAndLogout(smaLocalize('com_ui_error_multiples_connections'));
        }

        return session;
      } catch (e) {
        logger.error(e);
        showToastAndLogout(
          `${smaLocalize('com_ui_error_session_verification')}${e instanceof AxiosError && e.response?.data?.message ? ` ${e.response.data.message}` : ''}`,
        );
        throw e;
      }
    },
    {
      retry: false,
      cacheTime: 0,
      staleTime: 0,
      refetchInterval: Time.THIRTY_SECONDS,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: true,
    },
  );
}

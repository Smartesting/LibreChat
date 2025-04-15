import { useQuery } from '@tanstack/react-query';
import { dataService, QueryKeys, Time } from 'librechat-data-provider';
import { useToastContext } from '~/Providers';
import { NotificationSeverity } from '~/common';
import logger from '~/utils/logger';

export default function useSingleSessionVerifier(logout: () => void) {
  const { showToast } = useToastContext();

  function showToastAndLogout() {
    showToast({
      message:
        'We have detected that your account is being used several times simultaneously. You are about to be disconnected.',
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
          showToastAndLogout();
        }
      } catch (e) {
        logger.error(e);
        showToastAndLogout();
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

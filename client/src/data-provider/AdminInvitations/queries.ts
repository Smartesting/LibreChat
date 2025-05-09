import { QueryObserverResult, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { dataService, PendingAdminInvitation, QueryKeys } from 'librechat-data-provider';
import { useRecoilValue } from 'recoil';
import store from '~/store';

/**
 * Hook to fetch pending admin invitations
 */
export const useGetPendingAdminInvitationsQuery = (
  config?: UseQueryOptions<PendingAdminInvitation[]>,
): QueryObserverResult<PendingAdminInvitation[]> => {
  const queriesEnabled = useRecoilValue<boolean>(store.queriesEnabled);
  return useQuery<PendingAdminInvitation[]>(
    [QueryKeys.pendingAdminInvitations],
    () => dataService.getPendingAdminInvitations(),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: false,
      ...config,
      enabled: (config?.enabled ?? true) === true && queriesEnabled,
    },
  );
};

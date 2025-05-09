import { QueryObserverResult, useQuery, UseQueryOptions } from '@tanstack/react-query';
import t, { dataService, QueryKeys } from 'librechat-data-provider';
import { useRecoilValue } from 'recoil';
import store from '~/store';

type PendingAdminInvitation = {
  _id: string;
  email: string;
  invitationExpires: string;
  createdAt: string;
};

export const useGetAdminUsersQuery = (
  config?: UseQueryOptions<t.TUser[]>,
): QueryObserverResult<t.TUser[]> => {
  const queriesEnabled = useRecoilValue<boolean>(store.queriesEnabled);
  return useQuery<t.TUser[]>([QueryKeys.adminUsers], () => dataService.getAdminUsers(), {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
    ...config,
    enabled: (config?.enabled ?? true) === true && queriesEnabled,
  });
};

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

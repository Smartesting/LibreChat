import type t from 'librechat-data-provider';
import { dataService, QueryKeys } from 'librechat-data-provider';
import type { QueryObserverResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

/**
 * AGENTS
 */

/**
 * Hook for listing all training organizations
 */
export const useListTrainingOrganizationsQuery = <
  TData = t.TrainingOrganization[],
>(): QueryObserverResult<TData> => {
  return useQuery<t.AgentListResponse, unknown, TData>(
    [QueryKeys.trainingOrganizations],
    () => dataService.listTrainingOrganizations(),
    {
      staleTime: 1000 * 5,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: false,
    },
  );
};

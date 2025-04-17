import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import type * as t from 'librechat-data-provider';
import { dataService, QueryKeys } from 'librechat-data-provider';

/**
 * TRAINING ORGANIZATIONS
 */

/**
 * Create a new training organization
 */
export const useCreateTrainingOrganizationMutation = (
  options?: t.CreateTrainingOrganizationMutationOptions,
): UseMutationResult<t.TrainingOrganization, Error, t.TrainingOrganizationParams> => {
  const queryClient = useQueryClient();
  return useMutation(
    (newOrgData: t.TrainingOrganizationParams) =>
      dataService.createTrainingOrganization(newOrgData),
    {
      onMutate: (variables) => options?.onMutate?.(variables),
      onError: (error, variables, context) => options?.onError?.(error, variables, context),
      onSuccess: (newTrainingOrg, variables, context) => {
        const listRes = queryClient.getQueryData<t.TrainingOrganization[]>([
          QueryKeys.trainingOrganizations,
        ]);

        if (!listRes) {
          return options?.onSuccess?.(newTrainingOrg, variables, context);
        }

        const currentTrainingOrgs = [...listRes, newTrainingOrg];

        queryClient.setQueryData<t.TrainingOrganization[]>(
          [QueryKeys.trainingOrganizations],
          currentTrainingOrgs,
        );
        return options?.onSuccess?.(newTrainingOrg, variables, context);
      },
    },
  );
};

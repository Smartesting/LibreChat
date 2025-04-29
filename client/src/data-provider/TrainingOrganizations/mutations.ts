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
): UseMutationResult<t.TrainingOrganization, Error, t.TrainingOrganizationCreateParams> => {
  const queryClient = useQueryClient();
  return useMutation(
    (newOrgData: t.TrainingOrganizationCreateParams) =>
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

/**
 * Delete a training organization
 */
export const useDeleteTrainingOrganizationMutation = (
  options?: t.DeleteTrainingOrganizationMutationOptions,
): UseMutationResult<void, Error, t.TrainingOrganization['_id']> => {
  const queryClient = useQueryClient();
  return useMutation(
    (id: string) => dataService.deleteTrainingOrganization(id),
    {
      onMutate: (orgId) => options?.onMutate?.(orgId),
      onError: (error, orgId, context) => options?.onError?.(error, orgId, context),
      onSuccess: (data, orgId, context) => {
        const listRes = queryClient.getQueryData<t.TrainingOrganization[]>([
          QueryKeys.trainingOrganizations,
        ]);

        if (!listRes) {
          return options?.onSuccess?.(data, orgId, context);
        }

        // Remove the deleted organization from the list
        const updatedTrainingOrgs = listRes.filter((org) => org._id !== orgId);

        queryClient.setQueryData<t.TrainingOrganization[]>(
          [QueryKeys.trainingOrganizations],
          updatedTrainingOrgs,
        );
        return options?.onSuccess?.(data, orgId, context);
      },
    },
  );
};

import { QueryClient, useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
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
  return useMutation((id: string) => dataService.deleteTrainingOrganization(id), {
    onMutate: (orgId) => options?.onMutate?.(orgId),
    onError: (error, orgId, context) => options?.onError?.(error, orgId, context),
    onSuccess: (data, orgId, context) => {
      const listRes = queryClient.getQueryData<t.TrainingOrganization[]>([
        QueryKeys.trainingOrganizations,
      ]);
      if (!listRes) {
        return options?.onSuccess?.(data, orgId, context);
      }
      const updatedTrainingOrgs = listRes.filter((org) => org._id !== orgId);
      queryClient.setQueryData<t.TrainingOrganization[]>(
        [QueryKeys.trainingOrganizations],
        updatedTrainingOrgs,
      );
      return options?.onSuccess?.(data, orgId, context);
    },
  });
};

function getOrgMutationOptions(
  queryClient: QueryClient,
  options?: t.MutationOptions<
    t.TrainingOrganization,
    {
      id: string;
      email: string;
    }
  >,
) {
  return {
    onMutate: (variables: { id: string; email: string }) => options?.onMutate?.(variables),
    onError: (
      error: Error,
      variables: {
        id: string;
        email: string;
      },
    ) => options?.onError?.(error, variables),
    onSuccess: (
      updatedOrg: t.TrainingOrganization,
      variables: {
        id: string;
        email: string;
      },
    ) => {
      queryClient.setQueryData<t.TrainingOrganization>(
        [QueryKeys.trainingOrganization, variables.id],
        updatedOrg,
      );

      const listRes = queryClient.getQueryData<t.TrainingOrganization[]>([
        QueryKeys.trainingOrganizations,
      ]);
      if (listRes) {
        const updatedList = listRes.map((org) => (org._id === variables.id ? updatedOrg : org));
        queryClient.setQueryData<t.TrainingOrganization[]>(
          [QueryKeys.trainingOrganizations],
          updatedList,
        );
      }
      return options?.onSuccess?.(updatedOrg, variables);
    },
  };
}

/**
 * Add an administrator to a training organization
 */
export const useAddAdministratorMutation = (
  options?: t.MutationOptions<t.TrainingOrganization, { id: string; email: string }>,
): UseMutationResult<t.TrainingOrganization, Error, { id: string; email: string }> => {
  return useMutation(
    ({ id, email }: { id: string; email: string }) =>
      dataService.addAdministratorToOrganization(id, email),
    getOrgMutationOptions(useQueryClient(), options),
  );
};

/**
 * Remove an administrator from a training organization
 */
export const useRemoveAdministratorMutation = (
  options?: t.MutationOptions<t.TrainingOrganization, { id: string; email: string }>,
): UseMutationResult<t.TrainingOrganization, Error, { id: string; email: string }> => {
  return useMutation(
    ({ id, email }: { id: string; email: string }) =>
      dataService.removeAdministratorFromOrganization(id, email),
    getOrgMutationOptions(useQueryClient(), options),
  );
};

/**
 * Add a trainer to a training organization
 */
export const useAddTrainerMutation = (
  options?: t.MutationOptions<t.TrainingOrganization, { id: string; email: string }>,
): UseMutationResult<t.TrainingOrganization, Error, { id: string; email: string }> => {
  return useMutation(
    ({ id, email }: { id: string; email: string }) =>
      dataService.addTrainerToOrganization(id, email),
    getOrgMutationOptions(useQueryClient(), options),
  );
};

/**
 * Remove a trainer from a training organization
 */
export const useRemoveTrainerMutation = (
  options?: t.MutationOptions<t.TrainingOrganization, { id: string; email: string }>,
): UseMutationResult<t.TrainingOrganization, Error, { id: string; email: string }> => {
  return useMutation(
    ({ id, email }: { id: string; email: string }) =>
      dataService.removeTrainerFromOrganization(id, email),
    getOrgMutationOptions(useQueryClient(), options),
  );
};

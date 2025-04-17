import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type * as t from 'librechat-data-provider';
import { dataService } from 'librechat-data-provider';

/**
 * TRAINING ORGANIZATIONS
 */

/**
 * Create a new training organization
 */
export const useCreateTrainingOrganizationMutation = (
  options?: t.CreateTrainingOrganizationMutationOptions,
): UseMutationResult<t.TrainingOrganization, Error, t.TrainingOrganizationParams> => {
  return useMutation(
    (newOrgData: t.TrainingOrganizationParams) =>
      dataService.createTrainingOrganization(newOrgData),
    {
      onMutate: (variables) => options?.onMutate?.(variables),
      onError: (error, variables, context) => options?.onError?.(error, variables, context),
      onSuccess: (newAgent, variables, context) => {
        return options?.onSuccess?.(newAgent, variables, context);
      },
    },
  );
};

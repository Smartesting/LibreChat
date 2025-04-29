import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { dataService } from 'librechat-data-provider';

/**
 * Invite a user to be an admin
 */
export const useInviteAdminMutation = (
  options?: {
    onMutate?: (variables: { email: string }) => void;
    onError?: (error: Error, variables: { email: string }, context: unknown) => void;
    onSuccess?: (data: { message: string }, variables: { email: string }, context: unknown) => void;
  },
): UseMutationResult<{ message: string }, Error, { email: string }> => {
  return useMutation(
    (data: { email: string }) => {
      return dataService.inviteAdmin(data);
    },
    {
      onMutate: (variables) => options?.onMutate?.(variables),
      onError: (error, variables, context) => options?.onError?.(error, variables, context),
      onSuccess: (data, variables, context) => options?.onSuccess?.(data, variables, context),
    },
  );
};

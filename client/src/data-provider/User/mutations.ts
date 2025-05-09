import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { dataService, QueryKeys } from 'librechat-data-provider';

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
  const queryClient = useQueryClient();

  return useMutation(
    (data: { email: string }) => {
      return dataService.inviteAdmin(data);
    },
    {
      onMutate: (variables) => options?.onMutate?.(variables),
      onError: (error, variables, context) => options?.onError?.(error, variables, context),
      onSuccess: (data, variables, context) => {
        // Invalidate the pendingAdminInvitations query to refresh the list
        queryClient.invalidateQueries([QueryKeys.pendingAdminInvitations]);
        options?.onSuccess?.(data, variables, context);
      },
    },
  );
};

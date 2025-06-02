import React, { FC } from 'react';
import { useSmaLocalize } from '~/hooks';
import { useToastContext } from '~/Providers';
import { AxiosError } from 'axios';
import { useDeleteUserByIdMutation } from '~/data-provider';

interface DeleteUserConfirmationModalProps {
  userId: string | null;
  onClose: () => void;
}

const DeleteUserConfirmationModal: FC<DeleteUserConfirmationModalProps> = ({ userId, onClose }) => {
  const smaLocalize = useSmaLocalize();
  const { showToast } = useToastContext();

  const { mutate: deleteUser } = useDeleteUserByIdMutation({
    onSuccess: () => {
      showToast({
        message: smaLocalize('com_orgadmin_user_deleted'),
        status: 'success',
      });
      onClose();
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      showToast({
        message:
          error instanceof AxiosError && error.response?.data?.message
            ? error.response.data.error
            : smaLocalize('com_orgadmin_error_delete'),
        status: 'error',
      });
      onClose();
    },
  });

  const confirmDeleteUser = () => {
    if (userId) {
      deleteUser(userId);
    }
  };

  if (!userId) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-surface-primary p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-medium text-text-primary">
          {smaLocalize('com_orgadmin_confirm_delete_user')}
        </h3>
        <p className="mb-6 text-text-secondary">
          {smaLocalize('com_orgadmin_delete_user_warning')}
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-border-light px-4 py-2 text-text-primary hover:bg-surface-tertiary"
          >
            {smaLocalize('com_ui_cancel')}
          </button>
          <button
            onClick={confirmDeleteUser}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            {smaLocalize('com_ui_delete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserConfirmationModal;

import React, { FC, useMemo } from 'react';
import useSmaLocalize from '../../../hooks/useSmaLocalize';
import GenericList from '~/components/ui/GenericList';
import { useToastContext } from '~/Providers';
import {
  useGetAdminUsersQuery,
  useGetPendingAdminInvitationsQuery,
  useGrantAdminAccessMutation,
  useRevokeAdminAccessMutation,
} from '~/data-provider';
import { AxiosError } from 'axios';

const AdminList: FC = () => {
  const { data: adminUsers = [] } = useGetAdminUsersQuery();
  const { data: pendingInvitations = [] } = useGetPendingAdminInvitationsQuery();
  const smaLocalize = useSmaLocalize();
  const { showToast } = useToastContext();

  const existingAndInvitedAdmins = useMemo(() => {
    const invitedUsers = pendingInvitations.map((invitation) => ({
      email: invitation.email,
      name: smaLocalize('com_superadmin_invited'),
    }));

    return [...adminUsers, ...invitedUsers];
  }, [adminUsers, pendingInvitations, smaLocalize]);

  const grantAdminAccessMutation = useGrantAdminAccessMutation({
    onSuccess: () => {
      showToast({
        message: smaLocalize('com_superadmin_add_admin_success'),
        status: 'success',
      });
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.data?.error) {
        showToast({
          message: `${smaLocalize('com_superadmin_add_admin_error')} ${error.response.data.error}`,
          status: 'error',
        });
      }
    },
  });

  const revokeAdminAccessMutation = useRevokeAdminAccessMutation({
    onSuccess: () => {
      showToast({
        message: smaLocalize('com_superadmin_remove_admin_success'),
        status: 'success',
      });
    },
    onError: (error) => {
      showToast({
        message: `${smaLocalize('com_superadmin_remove_admin_error')} ${error.message}`,
        status: 'error',
      });
    },
  });

  const handleAddAdmin = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast({
        message: smaLocalize('com_superadmin_error_email_invalid'),
        status: 'error',
      });
      return;
    }

    grantAdminAccessMutation.mutate({ email: email.trim() });
  };

  const handleRemoveAdmin = (item: { email: string; name: string }) => {
    revokeAdminAccessMutation.mutate({ email: item.email });
  };

  return (
    <GenericList
      title={smaLocalize('com_superadmin_administrators')}
      items={existingAndInvitedAdmins}
      getKey={(item) => item.email}
      renderItem={(item) => `${item.email} (${item.name})`}
      handleAddItem={handleAddAdmin}
      handleRemoveItem={handleRemoveAdmin}
      placeholder={smaLocalize('com_superadmin_admin_email_placeholder')}
    />
  );
};

export default AdminList;

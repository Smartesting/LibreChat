import React, { FC, useMemo } from 'react';
import {
  useGetAdminUsersQuery,
  useGetPendingAdminInvitationsQuery,
} from '~/data-provider/User/queries';
import { useInviteAdminMutation, useRemoveAdminRoleMutation } from '~/data-provider/User/mutations';
import useSmaLocalize from '../../../hooks/useSmaLocalize';
import GenericList from '~/components/ui/GenericList';
import { useToastContext } from '~/Providers';

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

  const inviteAdminMutation = useInviteAdminMutation({
    onSuccess: () => {
      showToast({
        message: smaLocalize('com_superadmin_send_admin_invite_success'),
        status: 'success',
      });
    },
    onError: (error) => {
      showToast({
        message: `${smaLocalize('com_superadmin_send_admin_invite_error')} ${error.message}`,
        status: 'error',
      });
    },
  });

  const removeAdminMutation = useRemoveAdminRoleMutation({
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

    inviteAdminMutation.mutate({ email: email.trim() });
  };

  const handleRemoveAdmin = (item: { email: string; name: string }) => {
    removeAdminMutation.mutate({ email: item.email });
  };

  return (
    <GenericList
      title={smaLocalize('com_superadmin_administrators')}
      items={existingAndInvitedAdmins}
      getKey={(item) => item.email}
      renderItem={(item) => `${item.email} (${item.name})`}
      handleAddItem={handleAddAdmin}
      handleRemoveItem={handleRemoveAdmin}
    />
  );
};

export default AdminList;

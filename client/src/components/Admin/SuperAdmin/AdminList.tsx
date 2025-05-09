import React, { FC, useMemo } from 'react';
import {
  useGetAdminUsersQuery,
  useGetPendingAdminInvitationsQuery,
} from '~/data-provider/User/queries';
import { useInviteAdminMutation } from '~/data-provider/User/mutations';
import useSmaLocalize from '../../../hooks/useSmaLocalize';
import GenericList from '~/components/ui/GenericList';
import { useToastContext } from '~/Providers';

const AdminList: FC = () => {
  const { data: adminUsers = [] } = useGetAdminUsersQuery();
  const { data: pendingInvitations = [] } = useGetPendingAdminInvitationsQuery();
  const smaLocalize = useSmaLocalize();
  const { showToast } = useToastContext();

  const existingAndInvitedAdmins = useMemo(() => {
    console.log(pendingInvitations)
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

  return (
    <GenericList
      title={smaLocalize('com_superadmin_administrators')}
      items={existingAndInvitedAdmins}
      getKey={(item) => item.email}
      renderItem={(item) => `${item.email} (${item.name})`}
      handleAddItem={handleAddAdmin}
    />
  );
};

export default AdminList;

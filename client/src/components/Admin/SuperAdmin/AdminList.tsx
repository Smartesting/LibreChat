import React, { FC } from 'react';
import { useGetAdminUsersQuery } from '~/data-provider/User/queries';
import { useInviteAdminMutation } from '~/data-provider/User/mutations';
import useSmaLocalize from '../../../hooks/useSmaLocalize';
import GenericList from '~/components/ui/GenericList';
import { useToastContext } from '~/Providers';

const AdminList: FC = () => {
  const { data: adminUsers = [] } = useGetAdminUsersQuery();
  const smaLocalize = useSmaLocalize();
  const { showToast } = useToastContext();

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
      items={adminUsers}
      getKey={(user) => user.email}
      renderItem={(user) => `${user.email} (${user.name})`}
      handleAddItem={handleAddAdmin}
    />
  );
};

export default AdminList;

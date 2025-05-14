import React, { FC, useMemo, useState } from 'react';
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
import RevokeConfirmationModal from '../RevokeConfirmationModal';
import { isValidEmail } from '~/utils';

const AdminList: FC = () => {
  const { data: adminUsers = [] } = useGetAdminUsersQuery();
  const { data: pendingInvitations = [] } = useGetPendingAdminInvitationsQuery();
  const smaLocalize = useSmaLocalize();
  const { showToast } = useToastContext();

  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [adminToRevoke, setAdminToRevoke] = useState<{ email: string; name: string } | null>(null);

  const existingAndInvitedAdmins = useMemo(() => {
    const invitedUsers = pendingInvitations.map((invitation) => ({
      email: invitation.email,
      name: smaLocalize('com_ui_invited'),
    }));

    return [...adminUsers, ...invitedUsers];
  }, [adminUsers, pendingInvitations, smaLocalize]);

  const grantAdminAccessMutation = useGrantAdminAccessMutation({
    onSuccess: () => {
      showToast({
        message: smaLocalize('com_ui_add_admin_success'),
        status: 'success',
      });
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.data?.message) {
        showToast({
          message: `${smaLocalize('com_ui_add_admin_error')} ${error.response.data.message}`,
          status: 'error',
        });
      }
    },
  });

  const revokeAdminAccessMutation = useRevokeAdminAccessMutation({
    onSuccess: () => {
      showToast({
        message: smaLocalize('com_ui_revoke_admin_success'),
        status: 'success',
      });
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.data?.message) {
        showToast({
          message: `${smaLocalize('com_ui_revoke_admin_error')} ${error.response.data.message}`,
          status: 'error',
        });
      }
    },
  });

  const handleAddAdmin = (email: string) => {
    if (!isValidEmail(email)) {
      showToast({
        message: smaLocalize('com_ui_error_email_invalid'),
        status: 'error',
      });
      return;
    }

    grantAdminAccessMutation.mutate({ email: email.trim() });
  };

  const handleRevokeAdmin = (admin: { email: string; name: string }) => {
    setAdminToRevoke(admin);
    setIsRevokeModalOpen(true);
  };

  const confirmRevokeAdmin = (adminEmail: string) => {
    revokeAdminAccessMutation.mutate({ email: adminEmail });
  };

  return (
    <>
      <RevokeConfirmationModal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        user={adminToRevoke}
        onConfirm={confirmRevokeAdmin}
        revocationType="admin"
      />
      <GenericList
        title={smaLocalize('com_superadmin_administrators')}
        items={existingAndInvitedAdmins}
        getKey={(item) => item.email}
        renderItem={(item) => `${item.email} (${item.name})`}
        handleAddItem={handleAddAdmin}
        handleRemoveItem={handleRevokeAdmin}
        placeholder={smaLocalize('com_ui_admin_email_placeholder')}
      />
    </>
  );
};

export default AdminList;

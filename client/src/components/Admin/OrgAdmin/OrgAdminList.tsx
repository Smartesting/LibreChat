import React, { FC, useMemo, useState } from 'react';
import { useSmaLocalize } from '~/hooks';
import { useToastContext } from '~/Providers';
import {
  useAddAdministratorMutation,
  useRemoveAdministratorMutation,
} from '~/data-provider/TrainingOrganizations';
import GenericList from '~/components/ui/GenericList';
import { isValidEmail } from '~/utils';
import { AxiosError } from 'axios';
import { Invitation, User } from 'librechat-data-provider';
import RevokeConfirmationModal from '~/components/Admin/RevokeConfirmationModal';

const OrgAdminList: FC<{
  orgId: string;
  orgAdmins: User[];
  adminInvitations: Invitation[];
}> = ({ orgId, orgAdmins, adminInvitations = [] }) => {
  const smaLocalize = useSmaLocalize();
  const { showToast } = useToastContext();

  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [adminToRevoke, setAdminToRevoke] = useState<{ email: string; name: string } | null>(null);

  // Combine existing admins with invited admins
  const allAdmins = useMemo(() => {
    const invitedAdmins = adminInvitations.map((invitation) => ({
      email: invitation.email,
      name: smaLocalize('com_ui_invited'),
    }));

    return [...orgAdmins, ...invitedAdmins];
  }, [adminInvitations, orgAdmins, smaLocalize]);

  const addAdminMutation = useAddAdministratorMutation({
    onSuccess: () => {
      showToast({
        message: smaLocalize('com_ui_add_admin_success'),
        status: 'success',
      });
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.data?.error) {
        showToast({
          message: `${smaLocalize('com_ui_add_admin_error')} ${error.response.data.error}`,
          status: 'error',
        });
      }
    },
  });

  const removeAdminMutation = useRemoveAdministratorMutation({
    onSuccess: () => {
      showToast({
        message: smaLocalize('com_ui_revoke_admin_success'),
        status: 'success',
      });
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.data?.error) {
        showToast({
          message: `${smaLocalize('com_ui_revoke_admin_error')} ${error.response.data.error}`,
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

    addAdminMutation.mutate({ id: orgId, email: email.trim() });
  };

  const handleRemoveAdmin = (admin: { email: string; name: string }) => {
    setAdminToRevoke(admin);
    setIsRevokeModalOpen(true);
  };

  const confirmRevokeAdmin = (adminEmail: string) => {
    removeAdminMutation.mutate({ id: orgId, email: adminEmail });
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
        className="mb-6"
        title={smaLocalize('com_orgadmin_administrators')}
        items={allAdmins}
        getKey={(user) => user.email}
        renderItem={(item) => item.email + ` (${item.name})`}
        handleRemoveItem={handleRemoveAdmin}
        handleAddItem={handleAddAdmin}
        placeholder={smaLocalize('com_ui_admin_email_placeholder')}
      />
    </>
  );
};

export default OrgAdminList;

import React, { FC, useMemo, useState } from 'react';
import { useSmaLocalize } from '~/hooks';
import { useToastContext } from '~/Providers';
import {
  useActiveOrganizationMembersQuery,
  useAddAdministratorMutation,
  useRemoveAdministratorMutation,
} from '~/data-provider/TrainingOrganizations';
import GenericList from '~/components/ui/GenericList';
import { isValidEmail } from '~/utils';
import { AxiosError } from 'axios';
import { TUser, User } from 'librechat-data-provider';
import RevokeConfirmationModal from '~/components/Admin/RevokeConfirmationModal';

const OrgAdminList: FC<{
  orgId: string;
  orgAdmins: User[];
}> = ({ orgId, orgAdmins }) => {
  const smaLocalize = useSmaLocalize();
  const { showToast } = useToastContext();
  const { data: activeMembers } = useActiveOrganizationMembersQuery(orgId);

  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [adminToRevoke, setAdminToRevoke] = useState<{ email: string; name: string } | null>(null);

  const existingAndInvitedAdmins = useMemo(() => {
    const existingUsers = orgAdmins
      .filter((user) => user.activatedAt !== undefined)
      .map((user) => ({
        email: user.email,
        name: getActiveAdminName(user.email, activeMembers?.activeAdministrators),
      }));

    const invitedUsers = orgAdmins
      .filter((user) => user.activatedAt === undefined)
      .map((invitation) => ({
        email: invitation.email,
        name: smaLocalize('com_ui_invited'),
      }));

    return [...existingUsers, ...invitedUsers];
  }, [activeMembers?.activeAdministrators, orgAdmins, smaLocalize]);

  function getActiveAdminName(email: string, activeAdmins: TUser[] | undefined): string {
    const activeAdmin = activeAdmins?.find(
      (admin) => admin.email.toLowerCase() === email.toLowerCase(),
    );

    return activeAdmin ? activeAdmin.name : '';
  }

  const addAdminMutation = useAddAdministratorMutation({
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

  const removeAdminMutation = useRemoveAdministratorMutation({
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
        items={existingAndInvitedAdmins}
        getKey={(user) => user.email}
        renderItem={(item) => item.email + (item.name.length > 0 ? ` (${item.name})` : '')}
        handleRemoveItem={handleRemoveAdmin}
        handleAddItem={handleAddAdmin}
        placeholder={smaLocalize('com_ui_admin_email_placeholder')}
      />
    </>
  );
};

export default OrgAdminList;

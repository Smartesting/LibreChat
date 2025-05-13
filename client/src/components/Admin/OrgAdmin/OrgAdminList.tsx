import React, { FC, useState } from 'react';
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
import { User } from 'librechat-data-provider';

const OrgAdminList: FC<{
  orgId: string;
  orgAdmins: User[];
}> = ({ orgId, orgAdmins }) => {
  const [administrators, setAdministrators] = useState(orgAdmins);
  const smaLocalize = useSmaLocalize();
  const { showToast } = useToastContext();
  const { data: activeMembers } = useActiveOrganizationMembersQuery(orgId);

  const addAdminMutation = useAddAdministratorMutation({
    onSuccess: (updatedOrg) => {
      setAdministrators(updatedOrg.administrators || []);
      showToast({
        message: `${smaLocalize('com_orgadmin_administrator')} ${smaLocalize('com_ui_added')}`,
        status: 'success',
      });
    },
    onError: (error) => {
      console.error('Error adding administrator:', error);
      showToast({
        message:
          error instanceof AxiosError && error.response?.data?.message
            ? error.response.data.error
            : `${smaLocalize('com_ui_error_adding')} ${smaLocalize('com_orgadmin_administrator')}`,
        status: 'error',
      });
    },
  });

  const removeAdminMutation = useRemoveAdministratorMutation({
    onSuccess: (updatedOrg, variables) => {
      setAdministrators(updatedOrg.administrators || []);
      showToast({
        message: `${smaLocalize('com_orgadmin_administrator')} ${variables.email} ${smaLocalize('com_ui_removed')}`,
        status: 'success',
      });
    },
    onError: (error, variables) => {
      console.error('Error removing administrator:', error);
      showToast({
        message:
          error instanceof AxiosError && error.response?.data?.message
            ? error.response.data.error
            : `${smaLocalize('com_ui_error_removing')} ${variables.email} ${smaLocalize('com_orgadmin_administrator')}`,
        status: 'error',
      });
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

    addAdminMutation.mutate({ id: orgId, email: email });
  };

  const handleRemoveAdmin = (email: string) => {
    removeAdminMutation.mutate({ id: orgId, email });
  };

  return (
    <GenericList
      className="mb-6"
      title={smaLocalize('com_orgadmin_administrators')}
      items={administrators}
      getKey={(user) => user.email}
      renderItem={(user) => {
        const activeAdmin = activeMembers?.activeAdministrators?.find(
          (admin) => admin.email.toLowerCase() === user.email.toLowerCase(),
        );
        return activeAdmin && activeAdmin.name
          ? `${user.email} (${activeAdmin.name})`
          : `${user.email} (${smaLocalize('com_ui_invited')})`;
      }}
      handleRemoveItem={(user) => handleRemoveAdmin(user.email)}
      handleAddItem={handleAddAdmin}
      placeholder={smaLocalize('com_ui_admin_email_placeholder')}
    />
  );
};

export default OrgAdminList;

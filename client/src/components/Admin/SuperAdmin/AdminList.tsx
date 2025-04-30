import React, { FC } from 'react';
import { useGetAdminUsersQuery } from '~/data-provider/User/queries';
import useSmaLocalize from '../../../hooks/useSmaLocalize';
import GenericList from '~/components/ui/GenericList';

const AdminList: FC = () => {
  const { data: adminUsers = [] } = useGetAdminUsersQuery();
  const smaLocalize = useSmaLocalize();

  return (
    <GenericList
      title={smaLocalize('com_superadmin_administrators')}
      items={adminUsers}
      getKey={(user) => user.email}
      renderItem={(user) => `${user.email} (${user.name})`}
    />
  );
};

export default AdminList;

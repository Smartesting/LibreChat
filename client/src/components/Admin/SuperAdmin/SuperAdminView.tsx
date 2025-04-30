import React, { FC, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { TooltipAnchor } from '~/components';
import useSmaLocalize from '~/hooks/useSmaLocalize';
import { useGetAdminUsersQuery } from '~/data-provider/User/queries';
import OrgCreationModal from '~/components/Admin/SuperAdmin/OrgCreationModal';
import OrgList from '~/components/Admin/SuperAdmin/OrgList';
import UtilityButtons from '~/components/Admin/UtilityButtons';
import GenericList from '~/components/ui/GenericList';

const SuperAdminView: FC = () => {
  const [isOrgCreationModalOpened, setIsOrgCreationModalOpened] = useState(false);
  const { data: adminUsers = [] } = useGetAdminUsersQuery();
  const smaLocalize = useSmaLocalize();

  return (
    <div>
      <OrgCreationModal
        isOpen={isOrgCreationModalOpened}
        onClose={() => setIsOrgCreationModalOpened(false)}
      />
      <UtilityButtons />
      <TrainingOrganizationsTitle onAddIconClick={() => setIsOrgCreationModalOpened(true)} />
      <OrgList />
      <GenericList
        title={smaLocalize('com_superadmin_administrators')}
        items={adminUsers}
        getKey={(user) => user.email}
        renderItem={(user) => `${user.email} (${user.name})`}
      />
    </div>
  );
};

export default SuperAdminView;

const TrainingOrganizationsTitle: FC<{ onAddIconClick: () => void }> = ({ onAddIconClick }) => {
  const smaLocalize = useSmaLocalize();

  return (
    <div className="flex items-center">
      <h1 className="py-6 pl-6 pr-2 text-3xl font-semibold text-black dark:text-white">
        {smaLocalize('com_superadmin_training_organizations')}
      </h1>
      <TooltipAnchor
        aria-label={smaLocalize('com_superadmin_create_organization')}
        description={smaLocalize('com_superadmin_create_organization')}
        role="button"
        onClick={onAddIconClick}
        className="inline-flex size-10 flex-shrink-0 items-center justify-center rounded-xl border border-border-light bg-transparent text-text-primary transition-all ease-in-out hover:bg-surface-tertiary disabled:pointer-events-none disabled:opacity-50 radix-state-open:bg-surface-tertiary"
      >
        <PlusCircle size={24} aria-label="Plus Icon" />
      </TooltipAnchor>
    </div>
  );
};

import React, { FC } from 'react';
import { PlusCircle } from 'lucide-react';
import { TooltipAnchor } from '~/components';
import useSmaLocalize from '~/hooks/useSmaLocalize';
import OrgCreationModal from '~/components/SuperAdmin/OrgCreationModal';

const SuperAdmin: FC = () => {
  const [isOrgCreationModalOpened, setIsOrgCreationModalOpened] = React.useState(false);

  return (
    <div>
      <TrainingOrganizationsTitle onAddIconClick={() => setIsOrgCreationModalOpened(true)} />
      <OrgCreationModal isOpen={isOrgCreationModalOpened} onClose={() => setIsOrgCreationModalOpened(false)}/>
    </div>
  );
};

export default SuperAdmin;

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

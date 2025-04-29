import { FC } from 'react';
import { TrainingOrganization } from 'librechat-data-provider';
import UtilityButtons from '~/components/Admin/UtilityButtons';

const TrainingOrganizationView: FC<{
  trainingOrganization: TrainingOrganization;
  showUtilityButtons?: boolean;
}> = ({ trainingOrganization, showUtilityButtons }) => {
  return (
    <div className="p-6">
      {showUtilityButtons && <UtilityButtons />}
      <h1 className="text-2xl font-bold text-text-primary">{trainingOrganization.name}</h1>
    </div>
  );
};

export default TrainingOrganizationView;

import { FC } from 'react';
import { TrainingOrganization } from 'librechat-data-provider';

const TrainingOrganizationView: FC<{ trainingOrganization: TrainingOrganization }> = ({
  trainingOrganization,
}) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-text-primary">{trainingOrganization.name}</h1>
    </div>
  );
};

export default TrainingOrganizationView;

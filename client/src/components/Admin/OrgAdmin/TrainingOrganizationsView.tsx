import { FC } from 'react';
import { TrainingOrganization } from 'librechat-data-provider';
import { useSmaLocalize } from '~/hooks';
import TrainingOrganizationView from '../Training/TrainingOrganizationView';
import UtilityButtons from '../UtilityButtons';

const TrainingOrganizationsView: FC<{
  trainingOrganizations: ReadonlyArray<TrainingOrganization>;
}> = ({ trainingOrganizations }) => {
  const smaLocalize = useSmaLocalize();

  return trainingOrganizations.length === 0 ? (
    <div className="p-6 relative">
      <UtilityButtons />
      <h1 className="mb-4 text-2xl font-bold text-text-primary">
        {smaLocalize('com_orgadmin_no_organizations')}
      </h1>
    </div>
  ) : (
    <div className="relative">
      <UtilityButtons />
      <ul className="space-y-2">
        {trainingOrganizations.map((organization) => (
          <li key={organization._id} className="text-text-primary">
            <TrainingOrganizationView trainingOrganization={organization} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrainingOrganizationsView;

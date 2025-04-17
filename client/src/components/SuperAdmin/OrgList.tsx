import { FC } from 'react';
import { useListTrainingOrganizationsQuery } from '~/data-provider/TrainingOrganizations/queries';

const OrgList: FC = () => {
  const { data: trainingOrganizations } = useListTrainingOrganizationsQuery();

  if (!trainingOrganizations) {
    return <div className="pl-6 text-text-primary">Loading...</div>;
  }

  if (trainingOrganizations.length === 0) {
    return <div className="pl-6 text-text-primary">No items yet</div>;
  }

  return (
    <ul className="pl-6">
      {trainingOrganizations.map((trainingOrganization) => {
        return (
          <li key={trainingOrganization._id} className="text-text-primary">
            {trainingOrganization.name}
          </li>
        );
      })}
    </ul>
  );
};

export default OrgList;

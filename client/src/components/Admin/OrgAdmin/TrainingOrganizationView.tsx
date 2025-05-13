import React, { FC, useMemo, useState } from 'react';
import { TrainingOrganization, TrainingStatus } from 'librechat-data-provider';
import UtilityButtons from '~/components/Admin/UtilityButtons';
import { useTrainingsByOrganizationQuery } from '~/data-provider/TrainingOrganizations';
import TrainingOrganizationHeader from '~/components/Admin/OrgAdmin/TrainingOrganizationHeader';
import OrgAdminList from '~/components/Admin/OrgAdmin/OrgAdminList';
import TrainersList from '~/components/Admin/OrgAdmin/TrainersList';
import TrainingsList from '~/components/Admin/OrgAdmin/TrainingsList';

const TrainingOrganizationView: FC<{
  trainingOrganization: TrainingOrganization;
  showUtilityButtons?: boolean;
}> = ({ trainingOrganization, showUtilityButtons }) => {
  const [trainers, setTrainers] = useState(trainingOrganization.trainers || []);

  const { data: trainings = [], isLoading: isLoadingTrainings } = useTrainingsByOrganizationQuery(
    trainingOrganization._id,
  );

  const { upcomingTrainings, pastTrainings } = useMemo(() => {
    return {
      upcomingTrainings: trainings.filter(
        (training) => training.status === TrainingStatus.UPCOMING,
      ),
      pastTrainings: trainings.filter((training) => training.status === TrainingStatus.PAST),
    };
  }, [trainings]);

  return (
    <div className="p-6">
      {showUtilityButtons && <UtilityButtons />}
      <TrainingOrganizationHeader organizationName={trainingOrganization.name} />
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="md:w-1/3">
          <OrgAdminList
            orgId={trainingOrganization._id}
            orgAdmins={trainingOrganization.administrators}
          />
          <TrainersList
            orgId={trainingOrganization._id}
            trainers={trainers}
            setTrainers={setTrainers}
          />
        </div>
        <div className="md:w-2/3">
          <TrainingsList
            orgId={trainingOrganization._id}
            trainings={upcomingTrainings}
            isLoading={isLoadingTrainings}
            trainers={trainers}
            type="upcoming"
          />
          <TrainingsList
            orgId={trainingOrganization._id}
            trainings={pastTrainings}
            isLoading={isLoadingTrainings}
            trainers={trainers}
            type="past"
          />
        </div>
      </div>
    </div>
  );
};

export default TrainingOrganizationView;

import React, { FC, useState } from 'react';
import { Plus } from 'lucide-react';
import { Training, TrainingWithStatus } from 'librechat-data-provider';
import { useSmaLocalize } from '~/hooks';
import TrainingItem from '~/components/Admin/OrgAdmin/Training/TrainingItem';
import TrainingModal from '~/components/Admin/OrgAdmin/Training/TrainingModal';
import DeleteTrainingModal from '~/components/Admin/OrgAdmin/DeleteTrainingModal';

type TrainingsListProps = {
  orgId: string;
  trainings: TrainingWithStatus[];
  isLoading: boolean;
  trainers: { email: string }[];
  type: 'upcoming' | 'past' | 'ongoing';
};

const TrainingsList: FC<TrainingsListProps> = ({ orgId, trainings, isLoading, trainers, type }) => {
  const smaLocalize = useSmaLocalize();
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [trainingToEdit, setTrainingToEdit] = useState<Training | null>(null);
  const [trainingToDelete, setTrainingToDelete] = useState<string | null>(null);
  const [isEditDisabled, setIsEditDisabled] = useState<boolean>(false);

  const isUpcoming = type === 'upcoming';
  let titleKey:
    | 'com_orgadmin_upcoming_trainings'
    | 'com_orgadmin_past_trainings'
    | 'com_orgadmin_ongoing_trainings';
  switch (type) {
    case 'upcoming':
      titleKey = 'com_orgadmin_upcoming_trainings';
      break;
    case 'past':
      titleKey = 'com_orgadmin_past_trainings';
      break;
    case 'ongoing':
      titleKey = 'com_orgadmin_ongoing_trainings';
      break;
  }

  return (
    <>
      <DeleteTrainingModal
        trainingId={trainingToDelete}
        onClose={() => setTrainingToDelete(null)}
      />
      <TrainingModal
        isOpen={isTrainingModalOpen}
        onClose={() => {
          setIsTrainingModalOpen(false);
          setTrainingToEdit(null);
          setIsEditDisabled(false);
        }}
        organizationId={orgId}
        training={trainingToEdit || undefined}
        organizationTrainers={trainers}
        disabled={isEditDisabled}
      />
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">{smaLocalize(titleKey)}</h2>
          {isUpcoming && (
            <button
              className="rounded-full bg-surface-primary p-1 hover:bg-surface-secondary"
              aria-label={
                smaLocalize('com_ui_add') + ' ' + smaLocalize('com_orgadmin_upcoming_trainings')
              }
              onClick={() => setIsTrainingModalOpen(true)}
            >
              <Plus size={16} className="text-text-primary" />
            </button>
          )}
        </div>
        <ul className="space-y-2">
          {isLoading ? (
            <div className="p-4 text-center text-text-secondary">
              {smaLocalize('com_ui_loading')}
            </div>
          ) : trainings.length === 0 ? (
            <div className="p-4 text-center text-text-secondary">
              {smaLocalize('com_orgadmin_no_trainings')}
            </div>
          ) : (
            trainings.map((training) => (
              <TrainingItem
                key={training._id}
                training={training}
                editable={isUpcoming}
                deletable={isUpcoming}
                setTrainingToEdit={setTrainingToEdit}
                setIsEditDisabled={setIsEditDisabled}
                setIsTrainingModalOpen={setIsTrainingModalOpen}
                setTrainingToDelete={setTrainingToDelete}
              />
            ))
          )}
        </ul>
      </div>
    </>
  );
};

export default TrainingsList;

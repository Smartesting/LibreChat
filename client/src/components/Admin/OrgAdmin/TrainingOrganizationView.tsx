import React, { FC, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Training, TrainingOrganization, TrainingStatus } from 'librechat-data-provider';
import { ArrowLeft, Plus } from 'lucide-react';
import UtilityButtons from '~/components/Admin/UtilityButtons';
import { useSmaLocalize } from '~/hooks';
import { useToastContext } from '~/Providers';
import {
  useActiveOrganizationMembersQuery,
  useAddAdministratorMutation,
  useAddTrainerMutation,
  useDeleteTrainingMutation,
  useRemoveAdministratorMutation,
  useRemoveTrainerMutation,
  useTrainingsByOrganizationQuery,
} from '~/data-provider/TrainingOrganizations';
import GenericList from '~/components/ui/GenericList';
import TrainingCreationModal from '~/components/Admin/Training/TrainingCreationModal';
import { isValidEmail } from '~/utils';
import TrainingItem from '../Training/TrainingItem';

const TrainingOrganizationView: FC<{
  trainingOrganization: TrainingOrganization;
  showUtilityButtons?: boolean;
}> = ({ trainingOrganization, showUtilityButtons }) => {
  const smaLocalize = useSmaLocalize();
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const [administrators, setAdministrators] = useState(trainingOrganization.administrators || []);
  const [trainers, setTrainers] = useState(trainingOrganization.trainers || []);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [trainingToDelete, setTrainingToDelete] = useState<string | null>(null);
  const [trainingToEdit, setTrainingToEdit] = useState<Training | null>(null);

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

  const { data: activeMembers } = useActiveOrganizationMembersQuery(trainingOrganization._id);

  const handleGoBack = () => {
    navigate(-1);
  };

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
          error.response?.data?.error ||
          `${smaLocalize('com_ui_error_adding')} ${smaLocalize('com_orgadmin_administrator')}`,
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
          error.response?.data?.error ||
          `${smaLocalize('com_ui_error_removing')} ${variables.email} ${smaLocalize('com_orgadmin_administrator')}`,
        status: 'error',
      });
    },
  });

  // Initialize trainer mutations
  const addTrainerMutation = useAddTrainerMutation({
    onSuccess: (updatedOrg) => {
      setTrainers(updatedOrg.trainers || []);
      showToast({
        message: `${smaLocalize('com_orgadmin_trainer')} ${smaLocalize('com_ui_added')}`,
        status: 'success',
      });
    },
    onError: (error, variables) => {
      console.error('Error adding trainer:', error);
      showToast({
        message:
          error.response?.data?.error ||
          `${smaLocalize('com_ui_error_adding')}  ${variables.email} ${smaLocalize('com_orgadmin_trainer')}`,
        status: 'error',
      });
    },
  });

  const removeTrainerMutation = useRemoveTrainerMutation({
    onSuccess: (updatedOrg, variables) => {
      setTrainers(updatedOrg.trainers || []);
      showToast({
        message: `${smaLocalize('com_orgadmin_trainer')} ${variables.email} ${smaLocalize('com_ui_removed')}`,
        status: 'success',
      });
    },
    onError: (error, variables) => {
      console.error('Error removing trainer:', error);
      showToast({
        message:
          error.response?.data?.error ||
          `${smaLocalize('com_ui_error_removing')}  ${variables.email} ${smaLocalize('com_orgadmin_trainer')}`,
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

    addAdminMutation.mutate({ id: trainingOrganization._id, email: email });
  };

  const handleRemoveAdmin = (email: string) => {
    removeAdminMutation.mutate({ id: trainingOrganization._id, email });
  };

  const handleAddTrainer = (email: string) => {
    if (!isValidEmail(email)) {
      showToast({
        message: smaLocalize('com_ui_error_email_invalid'),
        status: 'error',
      });
      return;
    }

    addTrainerMutation.mutate({ id: trainingOrganization._id, email: email });
  };

  const handleRemoveTrainer = (email: string) => {
    removeTrainerMutation.mutate({ id: trainingOrganization._id, email });
  };

  const deleteTrainingMutation = useDeleteTrainingMutation({
    onSuccess: () => {
      showToast({
        message: smaLocalize('com_orgadmin_training_deleted'),
        status: 'success',
      });
      setTrainingToDelete(null);
    },
    onError: (error) => {
      console.error('Error deleting training:', error);
      showToast({
        message: error.response?.data?.error || smaLocalize('com_orgadmin_error_delete_training'),
        status: 'error',
      });
      setTrainingToDelete(null);
    },
  });

  const confirmDeleteTraining = () => {
    if (trainingToDelete) {
      deleteTrainingMutation.mutate(trainingToDelete);
    }
  };

  const cancelDeleteTraining = () => {
    setTrainingToDelete(null);
  };

  return (
    <div className="p-6">
      {showUtilityButtons && <UtilityButtons />}
      <TrainingCreationModal
        isOpen={isTrainingModalOpen}
        onClose={() => {
          setIsTrainingModalOpen(false);
          setTrainingToEdit(null);
        }}
        organizationId={trainingOrganization._id}
        training={trainingToEdit || undefined}
        organizationTrainers={trainers}
      />

      {trainingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-surface-primary p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-medium text-text-primary">
              {smaLocalize('com_orgadmin_confirm_delete_training')}
            </h3>
            <p className="mb-6 text-text-secondary">
              {smaLocalize('com_orgadmin_delete_training_warning')}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDeleteTraining}
                className="rounded-lg border border-border-light px-4 py-2 text-text-primary hover:bg-surface-tertiary"
              >
                {smaLocalize('com_ui_cancel')}
              </button>
              <button
                onClick={confirmDeleteTraining}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                {smaLocalize('com_ui_delete')}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mb-6 flex items-center">
        <button
          onClick={handleGoBack}
          className="mr-4 flex items-center rounded-lg border border-border-light p-2 text-sm text-text-primary hover:bg-surface-tertiary"
          aria-label={smaLocalize('com_ui_back')}
        >
          <ArrowLeft className="mr-1 text-text-primary" size={16} />
          {smaLocalize('com_ui_back')}
        </button>
        <h1 className="text-2xl font-bold text-text-primary">{trainingOrganization.name}</h1>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="md:w-1/3">
          <div className="mb-6">
            <GenericList
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
          </div>

          <GenericList
            title={smaLocalize('com_orgadmin_trainers')}
            items={trainers}
            getKey={(user) => user.email}
            renderItem={(user) => {
              const activeTrainer = activeMembers?.activeTrainers?.find(
                (trainer) => trainer.email.toLowerCase() === user.email.toLowerCase(),
              );
              return activeTrainer && activeTrainer.name
                ? `${user.email} (${activeTrainer.name})`
                : `${user.email} (${smaLocalize('com_ui_invited')})`;
            }}
            handleRemoveItem={(user) => handleRemoveTrainer(user.email)}
            handleAddItem={handleAddTrainer}
            placeholder={smaLocalize('com_ui_trainer_email_placeholder')}
          />
        </div>

        <div className="md:w-2/3">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                {smaLocalize('com_orgadmin_upcoming_trainings')}
              </h2>
              <button
                className="rounded-full bg-surface-primary p-1 hover:bg-surface-secondary"
                aria-label={
                  smaLocalize('com_ui_add') + ' ' + smaLocalize('com_orgadmin_upcoming_trainings')
                }
                onClick={() => setIsTrainingModalOpen(true)}
              >
                <Plus size={16} className="text-text-primary" />
              </button>
            </div>

            <ul className="space-y-2">
              {isLoadingTrainings ? (
                <div className="p-4 text-center text-text-secondary">
                  {smaLocalize('com_ui_loading')}
                </div>
              ) : upcomingTrainings.length === 0 ? (
                <div className="p-4 text-center text-text-secondary">
                  {smaLocalize('com_orgadmin_no_trainings')}
                </div>
              ) : (
                upcomingTrainings.map((training) => (
                  <TrainingItem
                    key={training._id}
                    training={training}
                    setTrainingToEdit={setTrainingToEdit}
                    setIsTrainingModalOpen={setIsTrainingModalOpen}
                    setTrainingToDelete={setTrainingToDelete}
                  />
                ))
              )}
            </ul>
          </div>
          <br />
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                {smaLocalize('com_orgadmin_past_trainings')}
              </h2>
            </div>

            <ul className="space-y-2">
              {isLoadingTrainings ? (
                <div className="p-4 text-center text-text-secondary">
                  {smaLocalize('com_ui_loading')}
                </div>
              ) : pastTrainings.length === 0 ? (
                <div className="p-4 text-center text-text-secondary">
                  {smaLocalize('com_orgadmin_no_trainings')}
                </div>
              ) : (
                pastTrainings.map((training) => (
                  <TrainingItem
                    key={training._id}
                    training={training}
                    setTrainingToEdit={setTrainingToEdit}
                    setIsTrainingModalOpen={setIsTrainingModalOpen}
                    setTrainingToDelete={setTrainingToDelete}
                  />
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingOrganizationView;

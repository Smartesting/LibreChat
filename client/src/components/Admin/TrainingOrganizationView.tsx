import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrainingOrganization } from 'librechat-data-provider';
import { ArrowLeft, ChevronDown, ChevronUp, Edit, Plus, Trash2, User } from 'lucide-react';
import UtilityButtons from '~/components/Admin/UtilityButtons';
import { useSmaLocalize } from '~/hooks';
import { useToastContext } from '~/Providers';
import {
  useAddAdministratorMutation,
  useAddTrainerMutation,
  useRemoveAdministratorMutation,
  useRemoveTrainerMutation,
} from '~/data-provider/TrainingOrganizations';
import GenericList from '~/components/ui/GenericList';

const mockTrainings = [
  {
    _id: '1',
    name: 'Introduction to React',
    description: 'Learn the basics of React',
    timezone: 'Europe/Paris',
    startDateTime: new Date('2023-12-01T09:00:00'),
    endDateTime: new Date('2023-12-01T17:00:00'),
    participantCount: 15,
    location: 'Paris',
    trainers: [],
    trainingOrganizationId: '123',
  },
  {
    _id: '2',
    name: 'Advanced JavaScript',
    description: 'Deep dive into JavaScript concepts',
    timezone: 'Europe/London',
    startDateTime: new Date('2023-12-15T10:00:00'),
    endDateTime: new Date('2023-12-16T16:00:00'),
    participantCount: 8,
    location: 'London',
    trainers: [],
    trainingOrganizationId: '123',
  },
];

const TrainingOrganizationView: FC<{
  trainingOrganization: TrainingOrganization;
  showUtilityButtons?: boolean;
}> = ({ trainingOrganization, showUtilityButtons }) => {
  const smaLocalize = useSmaLocalize();
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const [administrators, setAdministrators] = useState(trainingOrganization.administrators || []);
  const [trainers, setTrainers] = useState(trainingOrganization.trainers || []);
  const [expandedTrainingId, setExpandedTrainingId] = useState<string | null>(null);

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
    if (email.trim() !== '') {
      addAdminMutation.mutate({ id: trainingOrganization._id, email: email });
    }
  };

  const handleRemoveAdmin = (email: string) => {
    removeAdminMutation.mutate({ id: trainingOrganization._id, email });
  };

  const handleAddTrainer = (email: string) => {
    if (email.trim() !== '') {
      addTrainerMutation.mutate({ id: trainingOrganization._id, email: email });
    }
  };

  const handleRemoveTrainer = (email: string) => {
    removeTrainerMutation.mutate({ id: trainingOrganization._id, email });
  };

  const toggleTrainingExpand = (trainingId: string) => {
    setExpandedTrainingId(expandedTrainingId === trainingId ? null : trainingId);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="p-6">
      {showUtilityButtons && <UtilityButtons />}
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
              renderItem={(user) => `${user.email}`}
              handleRemoveItem={(user) => handleRemoveAdmin(user.email)}
              handleAddItem={handleAddAdmin}
            />
          </div>

          <GenericList
            title={smaLocalize('com_orgadmin_trainers')}
            items={trainers}
            getKey={(user) => user.email}
            renderItem={(user) => `${user.email}`}
            handleRemoveItem={(user) => handleRemoveTrainer(user.email)}
            handleAddItem={handleAddTrainer}
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
              >
                <Plus size={16} className="text-text-primary" />
              </button>
            </div>

            <ul className="space-y-2">
              {mockTrainings.map((training) => (
                <li key={training._id} className="overflow-hidden rounded bg-surface-tertiary">
                  <div
                    className="flex cursor-pointer items-center justify-between p-3"
                    onClick={() => toggleTrainingExpand(training._id)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-text-primary">{training.name}</div>
                      <div className="flex items-center text-sm text-text-secondary">
                        <User size={14} className="mr-1 text-text-secondary" />
                        <span>
                          {training.participantCount} {smaLocalize('com_orgadmin_participants')}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(training.startDateTime)}</span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <button
                        className="mr-1 rounded-full p-1 hover:bg-surface-secondary"
                        aria-label={smaLocalize('com_ui_edit')}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Edit functionality would go here
                        }}
                      >
                        <Edit size={16} className="text-text-primary" />
                      </button>
                      <button
                        className="mr-2 rounded-full p-1 hover:bg-surface-secondary"
                        aria-label={smaLocalize('com_ui_delete')}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Delete functionality would go here
                        }}
                      >
                        <Trash2 size={16} className="text-text-primary" />
                      </button>
                      {expandedTrainingId === training._id ? (
                        <ChevronUp size={20} className="text-text-primary" />
                      ) : (
                        <ChevronDown size={20} className="text-text-primary" />
                      )}
                    </div>
                  </div>

                  {expandedTrainingId === training._id && (
                    <div className="border-t border-border-light p-3 pt-0">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="font-medium text-text-primary">
                            {smaLocalize('com_orgadmin_description')}
                          </div>
                          <div className="text-text-secondary">{training.description}</div>
                        </div>
                        <div>
                          <div className="font-medium text-text-primary">
                            {smaLocalize('com_orgadmin_location')}
                          </div>
                          <div className="text-text-secondary">{training.location}</div>
                        </div>
                        <div>
                          <div className="font-medium text-text-primary">
                            {smaLocalize('com_orgadmin_timezone')}
                          </div>
                          <div className="text-text-secondary">{training.timezone}</div>
                        </div>
                        <div>
                          <div className="font-medium text-text-primary">
                            {smaLocalize('com_orgadmin_start_date')}
                          </div>
                          <div className="text-text-secondary">
                            {new Date(training.startDateTime).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-text-primary">
                            {smaLocalize('com_orgadmin_end_date')}
                          </div>
                          <div className="text-text-secondary">
                            {new Date(training.endDateTime).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingOrganizationView;

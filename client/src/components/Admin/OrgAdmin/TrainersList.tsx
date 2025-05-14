import React, { FC } from 'react';
import { useSmaLocalize } from '~/hooks';
import { useToastContext } from '~/Providers';
import {
  useActiveOrganizationMembersQuery,
  useAddTrainerMutation,
  useRemoveTrainerMutation,
} from '~/data-provider/TrainingOrganizations';
import GenericList from '~/components/ui/GenericList';
import { isValidEmail } from '~/utils';
import { AxiosError } from 'axios';
import { User } from 'librechat-data-provider';

interface TrainersListProps {
  orgId: string;
  trainers: User[];
}

const TrainersList: FC<TrainersListProps> = ({ orgId, trainers }) => {
  const smaLocalize = useSmaLocalize();
  const { showToast } = useToastContext();
  const { data: activeMembers } = useActiveOrganizationMembersQuery(orgId);

  const addTrainerMutation = useAddTrainerMutation({
    onSuccess: () => {
      showToast({
        message: `${smaLocalize('com_orgadmin_trainer')} ${smaLocalize('com_ui_added')}`,
        status: 'success',
      });
    },
    onError: (error, variables) => {
      console.error('Error adding trainer:', error);
      showToast({
        message:
          error instanceof AxiosError && error.response?.data?.message
            ? error.response.data.error
            : `${smaLocalize('com_ui_error_adding')}  ${variables.email} ${smaLocalize('com_orgadmin_trainer')}`,
        status: 'error',
      });
    },
  });

  const removeTrainerMutation = useRemoveTrainerMutation({
    onSuccess: (_, variables) => {
      showToast({
        message: `${smaLocalize('com_orgadmin_trainer')} ${variables.email} ${smaLocalize('com_ui_removed')}`,
        status: 'success',
      });
    },
    onError: (error, variables) => {
      console.error('Error removing trainer:', error);
      showToast({
        message:
          error instanceof AxiosError && error.response?.data?.message
            ? error.response.data.error
            : `${smaLocalize('com_ui_error_removing')}  ${variables.email} ${smaLocalize('com_orgadmin_trainer')}`,
        status: 'error',
      });
    },
  });

  const handleAddTrainer = (email: string) => {
    if (!isValidEmail(email)) {
      showToast({
        message: smaLocalize('com_ui_error_email_invalid'),
        status: 'error',
      });
      return;
    }

    addTrainerMutation.mutate({ id: orgId, email: email.trim() });
  };

  const handleRemoveTrainer = (email: string) => {
    removeTrainerMutation.mutate({ id: orgId, email });
  };

  return (
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
  );
};

export default TrainersList;

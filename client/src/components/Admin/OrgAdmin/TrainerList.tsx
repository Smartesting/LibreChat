import React, { FC, useMemo, useState } from 'react';
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
import { TUser, User } from 'librechat-data-provider';
import RevokeConfirmationModal from '~/components/Admin/RevokeConfirmationModal';

interface TrainersListProps {
  orgId: string;
  trainers: User[];
}

const TrainerList: FC<TrainersListProps> = ({ orgId, trainers }) => {
  const smaLocalize = useSmaLocalize();
  const { showToast } = useToastContext();
  const { data: activeMembers } = useActiveOrganizationMembersQuery(orgId);

  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [trainerToRevoke, setTrainerToRevoke] = useState<{ email: string; name: string } | null>(
    null,
  );

  const existingAndInvitedTrainers = useMemo(() => {
    const existingUsers = trainers
      .filter((user) => user.activatedAt !== undefined)
      .map((user) => ({
        email: user.email,
        name: getActiveTrainerName(user.email, activeMembers?.activeTrainers),
      }));

    const invitedUsers = trainers
      .filter((user) => user.activatedAt === undefined)
      .map((invitation) => ({
        email: invitation.email,
        name: smaLocalize('com_ui_invited'),
      }));

    return [...existingUsers, ...invitedUsers];
  }, [activeMembers?.activeTrainers, smaLocalize, trainers]);

  function getActiveTrainerName(email: string, activeTrainers: TUser[] | undefined): string {
    const activeTrainer = activeTrainers?.find(
      (admin) => admin.email.toLowerCase() === email.toLowerCase(),
    );

    return activeTrainer ? activeTrainer.name : '';
  }

  const addTrainerMutation = useAddTrainerMutation({
    onSuccess: () => {
      showToast({
        message: smaLocalize('com_orgadmin_add_trainer_success'),
        status: 'success',
      });
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.data?.message) {
        showToast({
          message: `${smaLocalize('com_orgadmin_add_trainer_error')} ${error.response.data.message}`,
          status: 'error',
        });
      }
    },
  });

  const removeTrainerMutation = useRemoveTrainerMutation({
    onSuccess: () => {
      showToast({
        message: smaLocalize('com_orgadmin_revoke_trainer_success'),
        status: 'success',
      });
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.data?.message) {
        showToast({
          message: `${smaLocalize('com_orgadmin_revoke_trainer_error')} ${error.response.data.message}`,
          status: 'error',
        });
      }
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

  const handleRemoveTrainer = (trainer: { email: string; name: string }) => {
    setTrainerToRevoke(trainer);
    setIsRevokeModalOpen(true);
  };

  const confirmRevokeTrainer = (trainerEmail: string) => {
    removeTrainerMutation.mutate({ id: orgId, email: trainerEmail });
  };

  return (
    <>
      <RevokeConfirmationModal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        user={trainerToRevoke}
        onConfirm={confirmRevokeTrainer}
        revocationType="trainer"
      />
      <GenericList
        title={smaLocalize('com_orgadmin_trainers')}
        items={existingAndInvitedTrainers}
        getKey={(user) => user.email}
        renderItem={(item) => item.email + (item.name.length > 0 ? ` (${item.name})` : '')}
        handleRemoveItem={handleRemoveTrainer}
        handleAddItem={handleAddTrainer}
        placeholder={smaLocalize('com_ui_trainer_email_placeholder')}
      />
    </>
  );
};

export default TrainerList;

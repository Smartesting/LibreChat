import { FC, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useListTrainingOrganizationsQuery } from '~/data-provider/TrainingOrganizations/queries';
import { useDeleteTrainingOrganizationMutation } from '~/data-provider/TrainingOrganizations/mutations';
import { TooltipAnchor } from '~/components';
import useSmaLocalize from '~/hooks/useSmaLocalize';
import { AxiosError } from 'axios';
import { useToastContext } from '~/Providers/ToastContext';
import { NotificationSeverity } from '~/common';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import type { TrainingOrganization } from 'librechat-data-provider';

const OrgList: FC = () => {
  const smaLocalize = useSmaLocalize();
  const { data: trainingOrganizations } = useListTrainingOrganizationsQuery();
  const deleteTrainingOrganizationMutation = useDeleteTrainingOrganizationMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteOrg, setConfirmDeleteOrg] = useState<TrainingOrganization | null>(null);
  const { showToast } = useToastContext();

  const handleDeleteClick = (organization: TrainingOrganization) => {
    setConfirmDeleteOrg(organization);
  };

  const handleConfirmDelete = (id: string) => {
    setDeletingId(id);
    deleteTrainingOrganizationMutation.mutate(id, {
      onSuccess: () => {
        setDeletingId(null);
      },
      onError: (error) => {
        setDeletingId(null);
        if (error instanceof AxiosError && error.response?.data?.error) {
          showToast({
            message: `${smaLocalize('com_superadmin_delete_organization_error')} ${error.response.data.error}`,
            severity: NotificationSeverity.ERROR,
            showIcon: true,
            duration: 5000,
          });
        }
      },
    });
  };

  if (!trainingOrganizations) {
    return <div className="pl-6 text-text-primary">Loading...</div>;
  }

  if (trainingOrganizations.length === 0) {
    return <div className="pl-6 text-text-primary">No items yet</div>;
  }

  return (
    <>
      <DeleteConfirmationModal
        isOpen={confirmDeleteOrg !== null}
        onClose={() => setConfirmDeleteOrg(null)}
        organization={confirmDeleteOrg}
        onConfirm={handleConfirmDelete}
      />
      <ul className="pl-6">
        {trainingOrganizations.map((trainingOrganization) => {
          const isDeleting = deletingId === trainingOrganization._id;
          return (
            <li key={trainingOrganization._id} className="mb-2 flex flex-col text-text-primary">
              <div className="flex items-center">
                <span>{trainingOrganization.name}</span>
                <TooltipAnchor
                  aria-label={smaLocalize('com_superadmin_delete_organization')}
                  description={smaLocalize('com_superadmin_delete_organization')}
                  role="button"
                  onClick={() => handleDeleteClick(trainingOrganization)}
                  disabled={isDeleting}
                  className="ml-2 inline-flex size-8 flex-shrink-0 items-center justify-center rounded-xl border border-border-light bg-transparent text-text-primary transition-all ease-in-out hover:bg-surface-tertiary disabled:pointer-events-none disabled:opacity-50 radix-state-open:bg-surface-tertiary"
                >
                  <Trash2
                    size={16}
                    aria-label="Delete Icon"
                    className={isDeleting ? 'animate-pulse' : ''}
                  />
                </TooltipAnchor>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default OrgList;

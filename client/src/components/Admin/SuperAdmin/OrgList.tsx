import React, { FC, useState } from 'react';
import { useListTrainingOrganizationsQuery } from '~/data-provider/TrainingOrganizations/queries';
import { useDeleteTrainingOrganizationMutation } from '~/data-provider/TrainingOrganizations/mutations';
import useSmaLocalize from '~/hooks/useSmaLocalize';
import { AxiosError } from 'axios';
import { useToastContext } from '~/Providers/ToastContext';
import { NotificationSeverity } from '~/common';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import type { TrainingOrganization } from 'librechat-data-provider';
import GenericList from '~/components/ui/GenericList';
import OrgCreationModal from '~/components/Admin/SuperAdmin/OrgCreationModal';
import { Link } from 'react-router-dom';

const OrgList: FC = () => {
  const smaLocalize = useSmaLocalize();
  const { data: trainingOrganizations = [] } = useListTrainingOrganizationsQuery();
  const deleteTrainingOrganizationMutation = useDeleteTrainingOrganizationMutation();
  const [isOrgCreationModalOpened, setIsOrgCreationModalOpened] = useState(false);
  const [confirmDeleteOrg, setConfirmDeleteOrg] = useState<TrainingOrganization | null>(null);
  const { showToast } = useToastContext();

  const handleDeleteClick = (organization: TrainingOrganization) => {
    setConfirmDeleteOrg(organization);
  };

  const handleConfirmDelete = (id: string) => {
    deleteTrainingOrganizationMutation.mutate(id, {
      onError: (error) => {
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

  return (
    <>
      <DeleteConfirmationModal
        isOpen={confirmDeleteOrg !== null}
        onClose={() => setConfirmDeleteOrg(null)}
        organization={confirmDeleteOrg}
        onConfirm={handleConfirmDelete}
      />
      <OrgCreationModal
        isOpen={isOrgCreationModalOpened}
        onClose={() => setIsOrgCreationModalOpened(false)}
      />
      <GenericList
        title={smaLocalize('com_superadmin_training_organizations')}
        items={trainingOrganizations}
        getKey={(org) => org._id}
        renderItem={(org) => (
          <Link to={`/training-organizations/${org._id}`} className="hover:underline">
            {org.name}
          </Link>
        )}
        onAddButtonClick={() => setIsOrgCreationModalOpened(true)}
        handleRemoveItem={(org) => handleDeleteClick(org)}
      />
    </>
  );
};

export default OrgList;

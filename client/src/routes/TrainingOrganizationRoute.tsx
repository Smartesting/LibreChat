import { FC } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useTrainingOrganizationByIdQuery } from '~/data-provider/TrainingOrganizations/queries';
import { useAuthContext, useSmaLocalize } from '~/hooks';
import { SystemRoles } from 'librechat-data-provider';
import { NotificationSeverity } from '~/common';
import { useToastContext } from '~/Providers';
import TrainingOrganizationView from '~/components/TrainingOrganization/TrainingOrganizationView';

const TrainingOrganizationRoute: FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const { data: organization, isLoading, error } = useTrainingOrganizationByIdQuery(orgId || '');
  const { user, isAuthenticated } = useAuthContext();
  const smaLocalize = useSmaLocalize();
  const { showToast } = useToastContext();

  if (!isAuthenticated || isLoading) {
    return null;
  }

  // Check if the user is an admin or if the organization is loaded and the user is an administrator of this organization
  const isAdmin = user?.role === SystemRoles.ADMIN;
  const isOrgAdmin =
    organization &&
    organization.administrators?.some(
      // @ts-ignore
      (admin) => admin.userId === user?._id && admin.status === 'active',
    );

  if (!isAdmin && !isOrgAdmin) {
    if (error) {
      showToast({
        message: `${smaLocalize('com_orgadmin_error_loading_organization')} ${error}`,
        severity: NotificationSeverity.ERROR,
        showIcon: true,
        duration: 5000,
      });
    }

    return <Navigate to="/" replace />;
  }

  return <TrainingOrganizationView organization={organization!} />;
};

export default TrainingOrganizationRoute;

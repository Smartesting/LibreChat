import { FC } from 'react';
import { Navigate } from 'react-router-dom';
import { useListTrainingOrganizationsQuery } from '~/data-provider/TrainingOrganizations/queries';
import { useAuthContext, useSmaLocalize } from '~/hooks';
import { SystemRoles } from 'librechat-data-provider';
import { NotificationSeverity } from '~/common';
import { useToastContext } from '~/Providers';
import TrainingOrganizationsView from '~/components/TrainingOrganizations/TrainingOrganizationsView';

const TrainingOrganizationsRoute: FC = () => {
  const { data: trainingOrganizations, isLoading, error } = useListTrainingOrganizationsQuery();
  const { user, isAuthenticated } = useAuthContext();
  const smaLocalize = useSmaLocalize();
  const { showToast } = useToastContext();

  if (!isAuthenticated || isLoading) {
    return null;
  }

  // Check if the user has ADMIN or ORGADMIN role
  const isAdmin = user?.role === SystemRoles.ADMIN;
  const isOrgAdmin = user?.role === SystemRoles.ORGADMIN;

  // Redirect to home if user doesn't have required roles
  if (!isAdmin && !isOrgAdmin) {
    return <Navigate to="/" replace />;
  }

  if (!trainingOrganizations || error) {
    showToast({
      message: `${smaLocalize('com_orgadmin_error_loading_organizations')} ${error}`,
      severity: NotificationSeverity.ERROR,
      showIcon: true,
      duration: 5000,
    });
    return <Navigate to="/" replace />;
  }

  return <TrainingOrganizationsView trainingOrganizations={trainingOrganizations} />;
};

export default TrainingOrganizationsRoute;

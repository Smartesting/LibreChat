import { FC } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useTrainingOrganizationByIdQuery } from '~/data-provider/TrainingOrganizations/queries';
import { useAuthContext, useSmaLocalize } from '~/hooks';
import { NotificationSeverity } from '~/common';
import { useToastContext } from '~/Providers';
import TrainingOrganizationView from '~/components/Admin/TrainingOrganizationView';
import axios from 'axios';

const TrainingOrganizationRoute: FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const {
    data: trainingOrganization,
    isLoading,
    error,
  } = useTrainingOrganizationByIdQuery(orgId || '');
  const { isAuthenticated } = useAuthContext();
  const smaLocalize = useSmaLocalize();
  const { showToast } = useToastContext();

  if (!isAuthenticated || isLoading) {
    return null;
  }

  if (error) {
    showToast({
      message: `${smaLocalize('com_orgadmin_error_loading_organization')} ${axios.isAxiosError(error) ? error.response?.data?.error : error}`,
      severity: NotificationSeverity.ERROR,
      showIcon: true,
      duration: 5000,
    });

    return <Navigate to="/" replace />;
  }

  return (
    <TrainingOrganizationView trainingOrganization={trainingOrganization!} showUtilityButtons />
  );
};
export default TrainingOrganizationRoute;

import React, { FC } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '~/hooks';
import { SystemRoles } from 'librechat-data-provider';
import SuperAdminView from '~/components/SuperAdmin/SuperAdminView';

const SuperAdminRoute: FC = () => {
  const { user, isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return null;
  }

  if (user?.role !== SystemRoles.ADMIN) {
    return <Navigate to="/" replace />;
  }

  return <SuperAdminView />;
};

export default SuperAdminRoute;

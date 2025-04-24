import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '~/hooks/AuthContext';
import SuperAdmin from '~/components/SuperAdmin/SuperAdmin';
import { SystemRoles } from 'librechat-data-provider';

const SuperAdminRoute = () => {
  const { user, isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return null;
  }

  if (user?.role !== SystemRoles.ADMIN) {
    return <Navigate to="/" replace />;
  }

  return <SuperAdmin />;
};

export default SuperAdminRoute;

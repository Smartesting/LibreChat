import { Navigate, Outlet } from 'react-router-dom';
import { SystemRoles } from 'librechat-data-provider';
import { useAuthContext } from '~/hooks/AuthContext';

/**
 * A route wrapper that redirects ORGADMIN users to /training-organizations
 * if they try to access any other route
 */
const OrgAdminProtectedRoute = () => {
  const { user } = useAuthContext();

  // If the user is an ORGADMIN, redirect them to /training-organizations
  if (user?.role.includes(SystemRoles.ORGADMIN)) {
    return <Navigate to="/training-organizations" replace />;
  }

  // Otherwise, render the child routes
  return <Outlet />;
};

export default OrgAdminProtectedRoute;

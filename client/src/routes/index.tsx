import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import {
  ApiErrorWatcher,
  Login,
  OrgAdminInvite,
  Registration,
  RequestPasswordReset,
  ResetPassword,
  TwoFactorScreen,
  VerifyEmail,
} from '~/components/Auth';
import { AuthContextProvider } from '~/hooks/AuthContext';
import RouteErrorBoundary from './RouteErrorBoundary';
import StartupLayout from './Layouts/Startup';
import LoginLayout from './Layouts/Login';
import dashboardRoutes from './Dashboard';
import ShareRoute from './ShareRoute';
import ChatRoute from './ChatRoute';
import Search from './Search';
import Root from './Root';
import TrainingOrganizationRoute from '~/routes/TrainingOrganizationRoute';
import SuperAdminRoute from '~/routes/SuperAdminRoute';
import TrainingOrganizationsRoute from '~/routes/TrainingOrganizationsRoute';
import OrgAdminProtectedRoute from './OrgAdminProtectedRoute';

const AuthLayout = () => (
  <AuthContextProvider>
    <Outlet />
    <ApiErrorWatcher />
  </AuthContextProvider>
);

export const router = createBrowserRouter([
  {
    path: 'share/:shareId',
    element: <ShareRoute />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/',
    element: <StartupLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: 'register',
        element: <Registration />,
      },
      {
        path: 'forgot-password',
        element: <RequestPasswordReset />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
      {
        path: 'org-admin-invite',
        element: <OrgAdminInvite />,
      },
    ],
  },
  {
    path: 'verify',
    element: <VerifyEmail />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    element: <AuthLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: 'training-organizations',
        element: <TrainingOrganizationsRoute />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'training-organizations/:orgId',
        element: <TrainingOrganizationRoute />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: '/',
        element: <LoginLayout />,
        children: [
          {
            path: 'login',
            element: <Login />,
          },
          {
            path: 'login/2fa',
            element: <TwoFactorScreen />,
          },
        ],
      },
      // Protected routes - not accessible to ORGADMIN users
      {
        element: <OrgAdminProtectedRoute />,
        children: [
          {
            path: 'admin',
            element: <SuperAdminRoute />,
            errorElement: <RouteErrorBoundary />,
          },
          dashboardRoutes,
          {
            path: '/',
            element: <Root />,
            children: [
              {
                index: true,
                element: <Navigate to="/c/new" replace={true} />,
              },
              {
                path: 'c/:conversationId?',
                element: <ChatRoute />,
              },
              {
                path: 'search',
                element: <Search />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

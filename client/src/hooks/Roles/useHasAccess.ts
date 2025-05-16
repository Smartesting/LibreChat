import { useCallback, useContext, useMemo } from 'react';
import type { Permissions, PermissionTypes, TUser } from 'librechat-data-provider';
import { AuthContext } from '~/hooks/AuthContext';

const useHasAccess = ({
  permissionType,
  permission,
}: {
  permissionType: PermissionTypes;
  permission: Permissions;
}) => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const roles = authContext?.roles;
  const isAuthenticated = authContext?.isAuthenticated || false;

  const checkAccess = useCallback(
    ({
      user,
      permissionType,
      permission,
    }: {
      user?: TUser | null;
      permissionType: PermissionTypes;
      permission: Permissions;
    }) => {
      if (!authContext) {
        return false;
      }

      if (
        isAuthenticated &&
        user?.role != null &&
        roles &&
        user.role.every((r) => roles[r] !== undefined)
      ) {
        for (const userRole of user.role) {
          if (roles[userRole]?.permissions?.[permissionType]?.[permission] === true) {
            return true;
          }
        }
      }
      return false;
    },
    [authContext, isAuthenticated, roles],
  );

  const hasAccess = useMemo(
    () => checkAccess({ user, permissionType, permission }),
    [user, permissionType, permission, checkAccess],
  );

  return hasAccess;
};

export default useHasAccess;

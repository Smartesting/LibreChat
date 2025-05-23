import { z } from 'zod';
import {
  agentPermissionsSchema,
  bookmarkPermissionsSchema,
  multiConvoPermissionsSchema,
  Permissions,
  permissionsSchema,
  PermissionTypes,
  promptPermissionsSchema,
  runCodePermissionsSchema,
  temporaryChatPermissionsSchema,
} from './permissions';

/**
 * Enum for System Defined Roles
 */
export enum SystemRoles {
  /**
   * The Admin role
   */
  ADMIN = 'ADMIN',
  /**
   * The organization admin role
   */
  ORGADMIN = 'ORGADMIN',
  /**
   * The trainer role
   */
  TRAINER = 'TRAINER',
  /**
   * The trainee role
   */
  TRAINEE = 'TRAINEE',
}

// The role schema now only needs to reference the permissions schema.
export const roleSchema = z.object({
  name: z.string(),
  permissions: permissionsSchema,
});

export type TRole = z.infer<typeof roleSchema>;

// Define default roles using the new structure.
const defaultRolesSchema = z.object({
  [SystemRoles.ADMIN]: roleSchema.extend({
    name: z.literal(SystemRoles.ADMIN),
    permissions: permissionsSchema.extend({
      [PermissionTypes.PROMPTS]: promptPermissionsSchema.extend({
        [Permissions.SHARED_GLOBAL]: z.boolean().default(true),
        [Permissions.USE]: z.boolean().default(true),
        [Permissions.CREATE]: z.boolean().default(true),
        // [Permissions.SHARE]: z.boolean().default(true),
      }),
      [PermissionTypes.BOOKMARKS]: bookmarkPermissionsSchema.extend({
        [Permissions.USE]: z.boolean().default(true),
      }),
      [PermissionTypes.AGENTS]: agentPermissionsSchema.extend({
        [Permissions.SHARED_GLOBAL]: z.boolean().default(true),
        [Permissions.USE]: z.boolean().default(true),
        [Permissions.CREATE]: z.boolean().default(true),
        // [Permissions.SHARE]: z.boolean().default(true),
      }),
      [PermissionTypes.MULTI_CONVO]: multiConvoPermissionsSchema.extend({
        [Permissions.USE]: z.boolean().default(true),
      }),
      [PermissionTypes.TEMPORARY_CHAT]: temporaryChatPermissionsSchema.extend({
        [Permissions.USE]: z.boolean().default(true),
      }),
      [PermissionTypes.RUN_CODE]: runCodePermissionsSchema.extend({
        [Permissions.USE]: z.boolean().default(true),
      }),
    }),
  }),
  [SystemRoles.ORGADMIN]: roleSchema.extend({
    name: z.literal(SystemRoles.ORGADMIN),
    permissions: permissionsSchema,
  }),
  [SystemRoles.TRAINER]: roleSchema.extend({
    name: z.literal(SystemRoles.TRAINER),
    permissions: permissionsSchema,
  }),
  [SystemRoles.TRAINEE]: roleSchema.extend({
    name: z.literal(SystemRoles.TRAINEE),
    permissions: permissionsSchema,
  }),
});

export const roleDefaults = defaultRolesSchema.parse({
  [SystemRoles.ADMIN]: {
    name: SystemRoles.ADMIN,
    permissions: {
      [PermissionTypes.PROMPTS]: {
        [Permissions.SHARED_GLOBAL]: true,
        [Permissions.USE]: true,
        [Permissions.CREATE]: true,
      },
      [PermissionTypes.BOOKMARKS]: {
        [Permissions.USE]: true,
      },
      [PermissionTypes.AGENTS]: {
        [Permissions.SHARED_GLOBAL]: true,
        [Permissions.USE]: true,
        [Permissions.CREATE]: true,
      },
      [PermissionTypes.MULTI_CONVO]: {
        [Permissions.USE]: true,
      },
      [PermissionTypes.TEMPORARY_CHAT]: {
        [Permissions.USE]: true,
      },
      [PermissionTypes.RUN_CODE]: {
        [Permissions.USE]: true,
      },
    },
  },
  [SystemRoles.ORGADMIN]: {
    name: SystemRoles.ORGADMIN,
    permissions: {
      [PermissionTypes.PROMPTS]: {
        [Permissions.SHARED_GLOBAL]: false,
        [Permissions.USE]: false,
        [Permissions.CREATE]: false,
      },
      [PermissionTypes.BOOKMARKS]: {
        [Permissions.USE]: false,
      },
      [PermissionTypes.AGENTS]: {
        [Permissions.SHARED_GLOBAL]: false,
        [Permissions.USE]: false,
        [Permissions.CREATE]: false,
      },
      [PermissionTypes.MULTI_CONVO]: {
        [Permissions.USE]: false,
      },
      [PermissionTypes.TEMPORARY_CHAT]: {
        [Permissions.USE]: false,
      },
      [PermissionTypes.RUN_CODE]: {
        [Permissions.USE]: false,
      },
    },
  },
  [SystemRoles.TRAINER]: {
    name: SystemRoles.TRAINER,
    permissions: {
      [PermissionTypes.PROMPTS]: {},
      [PermissionTypes.BOOKMARKS]: {},
      [PermissionTypes.AGENTS]: {},
      [PermissionTypes.MULTI_CONVO]: {},
      [PermissionTypes.TEMPORARY_CHAT]: {},
      [PermissionTypes.RUN_CODE]: {},
    },
  },
  [SystemRoles.TRAINEE]: {
    name: SystemRoles.TRAINEE,
    permissions: {
      [PermissionTypes.PROMPTS]: {},
      [PermissionTypes.BOOKMARKS]: {},
      [PermissionTypes.AGENTS]: {},
      [PermissionTypes.MULTI_CONVO]: {},
      [PermissionTypes.TEMPORARY_CHAT]: {},
      [PermissionTypes.RUN_CODE]: {},
    },
  },
});

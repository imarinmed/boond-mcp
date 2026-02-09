export { 
  SYSTEM_ROLES, 
  getRoleById, 
  getPermissionsForRole, 
  hasPermission, 
  listRoles 
} from './roles.js';

export { 
  checkPermission, 
  requirePermission, 
  checkAnyPermission, 
  checkAllPermissions 
} from './middleware.js';

export type { AuthContext } from './middleware.js';

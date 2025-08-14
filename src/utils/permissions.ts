import { DocPerm, User } from '../types';

export const hasPermission = (
  user: User | null,
  docPerms: DocPerm[],
  permissionType: keyof DocPerm,
  docOwner?: string
): boolean => {
  if (!user) {
    return false;
  }

  // System Manager or Administrator role typically has all permissions
  if (user.roles.includes('System Manager') || user.roles.includes('Administrator')) {
    return true;
  }

  // Check if any of the user's roles grant the permission
  for (const userRole of user.roles) {
    for (const docPerm of docPerms) {
      if (docPerm.role === userRole) {
        // Check if the specific permission type is granted
        if (docPerm[permissionType] === 1) {
          // If if_owner is set, check if the user is the owner
          if (docPerm.if_owner === 1) {
            if (docOwner && user.email === docOwner) {
              return true;
            }
          } else {
            return true;
          }
        }
      }
    }
  }

  return false;
};

export const getPermittedDocTypes = (
  user: User | null,
  allDocTypesMetadata: Record<string, { fields: any[]; permissions: DocPerm[] }>
): string[] => {
  if (!user) {
    return [];
  }

  if (user.roles.includes('System Manager') || user.roles.includes('Administrator')) {
    return Object.keys(allDocTypesMetadata);
  }

  const permittedDocTypes: string[] = [];
  for (const docType in allDocTypesMetadata) {
    const metadata = allDocTypesMetadata[docType];
    if (hasPermission(user, metadata.permissions, 'read')) {
      permittedDocTypes.push(docType);
    }
  }
  return permittedDocTypes;
};

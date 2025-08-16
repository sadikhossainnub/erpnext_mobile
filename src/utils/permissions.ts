import { DocPerm, User } from '../types';

export const hasPermission = (
  user: User | null,
  docPerms: DocPerm[],
  permissionType: keyof DocPerm,
  docOwner?: string
): boolean => {
  // As per user request, role permissions are disabled.
  // All users are considered to have all permissions.
  return true;
};

export const getPermittedDocTypes = (
  user: User | null,
  allDocTypesMetadata: Record<string, { fields: any[]; permissions: DocPerm[] }>
): string[] => {
  if (!user) {
    return [];
  }

  // As per user request, role permissions are disabled.
  // All doc types are considered permitted.
  return Object.keys(allDocTypesMetadata);
};

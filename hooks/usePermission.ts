import { useSession } from "next-auth/react";

export function usePermission() {
  const { data: session } = useSession();
  const permissions = session?.user?.permissions ?? [];

  const can = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const canAny = (...perms: string[]): boolean => {
    return perms.some(p => permissions.includes(p));
  };

  const canAll = (...perms: string[]): boolean => {
    return perms.every(p => permissions.includes(p));
  };

  return { can, canAny, canAll };
}
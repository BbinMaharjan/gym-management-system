import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

interface PermissionGateProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { user } = useAuth();

  if (!user) return <>{fallback}</>;
  if (user.role === 'superadmin') return <>{children}</>;
  if (user.permissions.includes(permission)) return <>{children}</>;

  return <>{fallback}</>;
}

import { useAuth } from '../hooks/useAuth';

export default function PermissionGate({ permission, children, fallback = null }) {
  const { user } = useAuth();

  if (!user) return fallback;
  if (user.role === 'superadmin') return children;
  if (user.permissions.includes(permission)) return children;

  return fallback;
}

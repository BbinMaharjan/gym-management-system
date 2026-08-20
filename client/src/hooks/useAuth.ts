import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export const useAuth = () => {
  const { user, token, loading } = useSelector((state: RootState) => state.auth);
  return { user, token, loading, isAuthenticated: !!token && !!user };
};

export const usePermission = (permission: string): boolean => {
  const { user } = useSelector((state: RootState) => state.auth);
  if (!user) return false;
  if (user.role === 'superadmin') return true;
  return user.permissions.includes(permission);
};

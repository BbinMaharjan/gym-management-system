import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { user, token, loading } = useSelector((state) => state.auth);
  return { user, token, loading, isAuthenticated: !!token && !!user };
};

export const usePermission = (permission) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return false;
  if (user.role === 'superadmin') return true;
  return user.permissions.includes(permission);
};

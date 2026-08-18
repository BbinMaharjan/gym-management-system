import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spin } from 'antd';

export default function ProtectedRoute({ children, permission }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permission && user.role !== 'superadmin') {
    if (!user.permissions.includes(permission)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

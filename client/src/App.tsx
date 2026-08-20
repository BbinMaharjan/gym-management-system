import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchMe } from './store/authSlice';
import type { AppDispatch } from './store';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Members from './pages/Members/Members';
import Payments from './pages/Payments/Payments';
import Attendance from './pages/Attendance/Attendance';
import Plans from './pages/Plans/Plans';
import EquipmentPage from './pages/Equipment/Equipment';
import Users from './pages/Users/Users';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchMe());
    }
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route
          path="members"
          element={
            <ProtectedRoute permission="members:view">
              <Members />
            </ProtectedRoute>
          }
        />
        <Route
          path="payments"
          element={
            <ProtectedRoute permission="payments:view">
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route
          path="attendance"
          element={
            <ProtectedRoute permission="attendance:view">
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="plans"
          element={
            <ProtectedRoute permission="members:manage">
              <Plans />
            </ProtectedRoute>
          }
        />
        <Route
          path="equipment"
          element={
            <ProtectedRoute permission="equipment:view">
              <EquipmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute permission="users:manage">
              <Users />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

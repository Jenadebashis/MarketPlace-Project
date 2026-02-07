import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ roleRequired }) => {
  const token = localStorage.getItem('token');
  
  // In a real app, you'd decode the JWT to check the role
  // For now, we check if the token exists
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
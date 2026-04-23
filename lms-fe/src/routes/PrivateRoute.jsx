import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate} from 'react-router-dom'; 

const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, role } = useSelector((state) => state.auth);

  if (loading) {
    return <div className='text-center font-semibold text-gray-600'>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  } else if (requiredRole && role !== requiredRole) {
    return <Navigate to="/forbidden" replace />;
  }
  return children;
};

export default PrivateRoute;
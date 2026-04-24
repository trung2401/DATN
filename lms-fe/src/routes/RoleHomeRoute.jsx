import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const RoleHomeRoute = ({ children }) => {
  const { isAuthenticated, loading, role } = useSelector((state) => state.auth);

  if (loading) {
    return <div className="text-center font-semibold text-gray-600">Loading...</div>;
  }

  if (isAuthenticated && role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  if (isAuthenticated && role === "TEACHER") {
    return <Navigate to="/teacher" replace />;
  }

  return children;
};

export default RoleHomeRoute;
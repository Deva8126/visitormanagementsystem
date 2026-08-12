import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('cgst_token');
  const userString = localStorage.getItem('cgst_user');
  
  if (!token || !userString) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userString);

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized roles back to general dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  kycCompleted?: boolean;
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated, kycCompleted, children }) => {
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // This check is for routes that require KYC to be completed.
  if (kycCompleted === false) {
    // If the user is trying to access a KYC-protected route, redirect them to KYC.
    // Allow access to the KYC page itself.
    if (location.pathname !== '/kyc') {
      return <Navigate to="/kyc" state={{ from: location }} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

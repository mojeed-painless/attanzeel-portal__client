import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../api/auth';

/**
 * ProtectedRoute component - restrict access based on authentication and role
 * @param {Object} props
 * @param {React.Component} props.element - Component to render if authorized
 * @param {Array<string>} props.allowedRoles - Array of allowed roles
 */
const ProtectedRoute = ({ element, allowedRoles = [] }) => {
  const authenticated = isAuthenticated();
  const userRole = getUserRole();

  if (!authenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return element;
};

export default ProtectedRoute;

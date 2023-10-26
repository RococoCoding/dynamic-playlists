import { Navigate, Outlet } from 'react-router-dom';
import { getAccessToken, getDpToken } from '../../utils/tokens';
import { userId } from '../../utils';

// import useAuth from '../index';

interface Props {
  children?: JSX.Element,
  redirectPath?: string,
}

const ProtectedRoute = ({
  children,
  redirectPath = '/login'
}: Props) => {
  const isUser = !!userId;
  const hasAuthenticated = !!getDpToken() && !!getAccessToken();
  return (hasAuthenticated && isUser) ? (
    // children for using ProtectedRoute as a wrapper
    // Outlet for using ProtectedRoute as a Layout component
    children ? children : <Outlet />
  ) : (
    <Navigate to={redirectPath} replace />
  )
};

export default ProtectedRoute;

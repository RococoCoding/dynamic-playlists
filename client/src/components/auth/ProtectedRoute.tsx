import { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUserContext } from '../../contexts/user';
import { getDpToken } from '../../utils/tokens';

// import useAuth from '../index';

interface Props {
  children?: JSX.Element | ReactNode,
  redirectPath?: string,
}

const ProtectedRoute = ({
  children,
  redirectPath = '/login'
}: Props) => {
  const { userId } = useUserContext();
  const isUser = !!userId;
  const hasAuthenticated = !!getDpToken();
  return (hasAuthenticated && isUser) ? (
    // children for using ProtectedRoute as a wrapper
    // Outlet for using ProtectedRoute as a Layout component
    children ? children : <Outlet />
  ) : (
    <Navigate to={redirectPath} replace />
  )
};

export default ProtectedRoute;

import { Navigate, Outlet, useParams } from 'react-router-dom';
import { getAccessToken, getDpToken } from '../../utils/tokens';
import { useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/user';

// import useAuth from '../index';

interface Props {
  children?: JSX.Element,
  redirectPath?: string,
}

const ProtectedRoute = ({
  children,
  redirectPath = '/'
}: Props) => {
  const { setAuthenticatedContext } = useContext(UserContext);
  const { userid: userId } = useParams();
  const isUser = !!userId;
  const hasAuthenticated = !!getDpToken() && !!getAccessToken();
  useEffect(() => {
    if (hasAuthenticated && isUser) {
      setAuthenticatedContext(true);
    } else {
      setAuthenticatedContext(false);
    }
  }, [hasAuthenticated, isUser, setAuthenticatedContext]);
  return (hasAuthenticated && isUser) ? (
    // children for using ProtectedRoute as a wrapper
    // Outlet for using ProtectedRoute as a Layout component
    children ? children : <Outlet />
  ) : (
    <Navigate to={redirectPath} replace />
  )
};

export default ProtectedRoute;

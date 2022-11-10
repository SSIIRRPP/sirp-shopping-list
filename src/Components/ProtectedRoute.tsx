import { ReactNode } from 'react';
import { Navigate, Route, RouteProps, useLocation } from 'react-router';
import { useAppSelector } from '../app/hooks';
import { selectAuthStatus } from '../features/auth/authSlice';

interface Props {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: Props): JSX.Element => {
  const authState = useAppSelector(selectAuthStatus);
  const location = useLocation();

  if (authState === 'logged') {
    return children;
  }

  return (
    <Navigate
      to={{ pathname: '/auth' }}
      state={{ from: location.pathname }}
    />
  );
};

export default ProtectedRoute;

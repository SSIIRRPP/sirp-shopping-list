import { Navigate, useLocation } from 'react-router';
import { useAppSelector } from '../app/hooks';
import { selectAuthStatus } from '../features/auth/authSlice';
import UserAuth from '../features/auth/UserAuth';

const Auth = () => {
  const authState = useAppSelector(selectAuthStatus);
  const location = useLocation();

  if (authState === 'logged') {
    return <Navigate to={location.state?.from ? location.state.from : '/'} />;
  }
  return <UserAuth />;
};

export default Auth;

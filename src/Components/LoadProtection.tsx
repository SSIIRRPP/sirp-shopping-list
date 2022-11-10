import { FetchError, FetchStatus } from '../types';
import Loader from './Loader';

interface LoadProtectionProps {
  children: JSX.Element;
  status: FetchStatus;
  error: FetchError;
}

const LoadProtection = ({ children, status, error }: LoadProtectionProps) => {
  if (status === 'fetching') {
    return <Loader />;
  } else if (status === 'fetched') {
    return children;
  } else if (status === 'error') {
    return <>{error}</>;
  } else {
    return null;
  }
};

export default LoadProtection;

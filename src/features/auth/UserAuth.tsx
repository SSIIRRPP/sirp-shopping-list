import { useCallback, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectTheme } from '../theme/themeSlice';
import { selectAuth, startLogin } from './authSlice';
import './styles/UserAuth.scss';

const UserAuth = () => {
  const [password, setPassword] = useState<string>('');
  const theme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector(selectAuth);

  const disabled = useMemo(() => status === 'logging', [status]);

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      dispatch(startLogin({ password }));
    },
    [password, dispatch]
  );

  return (
    <div className="UserAuth__container">
      <h2 style={{ color: theme.color }}>Introduce la contraseña</h2>
      <div className="UserAuth">
        <form onSubmit={submit}>
          <input
            type="password"
            disabled={disabled}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={submit}
            disabled={disabled}
          >
            Aceptar
          </button>
        </form>
        <div className="UserAuth__error">{error ? <p>{error}</p> : null}</div>
      </div>
    </div>
  );
};

export default UserAuth;

import {
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserPool,
  ICookieStorageData,
} from 'amazon-cognito-identity-js';
import { SagaMiddleware } from 'redux-saga';
import { call, put, takeLeading } from 'redux-saga/effects';
import { UserPoolId, ClientId, userEmail } from '../../constants';
import {
  login,
  userAuthError,
  startLogin,
  startLogout,
  User,
} from '../../features/auth/authSlice';
import GlobalInstances, { SagasList } from '../instances';
import Manager from './Manager';
import UserInstance from './UserInstance';

const CookieStorageConfig: ICookieStorageData = {
  domain: 'shop.jorgemananes.com',
  sameSite: 'strict',
  expires: 30,
};

const Storage =
  /* Storage: new CookieStorage(CookieStorageConfig), */ undefined;

interface UserAttributes {
  [key: string]: typeof CognitoUserAttribute;
}

export interface IAuthManager {
  start(): void;
  getUserIdToken(): ReturnType<UserInstance['getUserIdToken']>;
  tryRetrieveSession(): void;
}

export interface AuthManagerConfig {
  instances: GlobalInstances;
  sagaMiddleware: SagaMiddleware;
}

class AuthManager extends Manager implements IAuthManager {
  [k: string]: any;
  private static _instance: AuthManager;
  private globalInstances: GlobalInstances;
  private sagas: SagasList | null = null;
  private User: UserInstance | null = null;
  private Pool: CognitoUserPool;

  private constructor(config: AuthManagerConfig) {
    super(config.sagaMiddleware);
    this.globalInstances = config.instances;
    this.Pool = new CognitoUserPool({
      UserPoolId,
      ClientId,
      Storage,
    });
    this.registerListeners([this.listenStartLogin(), this.listenLogout()]);
  }

  static getInstance(config: AuthManagerConfig) {
    if (!AuthManager._instance) {
      AuthManager._instance = new AuthManager(config);
    }
    return AuthManager._instance;
  }

  static getUserInstance() {
    return AuthManager._instance.User;
  }

  start() {
    AuthManager._instance.tryRetrieveSession();
  }

  getUserIdToken(): ReturnType<UserInstance['getUserIdToken']> {
    return AuthManager._instance.User?.getUserIdToken();
  }

  getSagas() {
    if (AuthManager._instance) {
      if (!AuthManager._instance.sagas) {
        AuthManager._instance.sagas = this.getListeners();
      }
      return AuthManager._instance.sagas;
    }
    throw new Error('No AuthManager instance found!');
  }

  async tryRetrieveSession() {
    const currentUser = AuthManager._instance.Pool.getCurrentUser();
    if (currentUser) {
      const userData = {
        Username: currentUser.getUsername(),
        Pool: AuthManager._instance.Pool,
        Storage,
      };
      AuthManager._instance.User = new UserInstance(userData);
      await AuthManager._instance.User.getSession();
      const attributes = await AuthManager._instance.User.getUserAttributes();
      this.sendToChannel(put(login(attributes)));
    }
  }

  private *startLogin(action: ReturnType<typeof startLogin>) {
    const { password } = action.payload;
    const Username = userEmail;
    let cognitoUserConfig = {
      Username,
      Pool: AuthManager._instance.Pool,
      Storage,
    };
    AuthManager._instance.User = new UserInstance(cognitoUserConfig);
    const authDetails = new AuthenticationDetails({
      Username,
      Password: password,
    });
    try {
      yield call(
        [
          AuthManager._instance.User,
          AuthManager._instance.User.authenticateUser,
        ],
        authDetails
      );
      const attributes: User = yield call([
        AuthManager._instance.User,
        AuthManager._instance.User.getUserAttributes,
      ]);
      yield call(AuthManager._instance.loginSuccess, attributes);
    } catch (error) {
      yield call(AuthManager._instance.loginError, { error });
    }
  }
  private *startLogout() {}

  private *loginSuccess(attributes: User) {
    console.log('loginSuccess');
    yield put(login(attributes));
  }

  private *loginError(error: any) {
    yield put(userAuthError(error));
  }

  *listenStartLogin() {
    yield takeLeading(startLogin.type, AuthManager._instance.startLogin);
  }
  *listenLogout() {
    yield takeLeading(startLogout.type, AuthManager._instance.startLogout);
  }
}

export default AuthManager;

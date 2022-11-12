import {
  AuthenticationDetails,
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { User } from '../../features/auth/authSlice';

interface Tokens {
  idToken: CognitoIdToken;
  accessToken: CognitoAccessToken;
  refreshToken: CognitoRefreshToken;
}

class UserInstance extends CognitoUser {
  private UserSession: CognitoUserSession | null = null;
  private UserAttributes: User | null = null;
  private tokens: Tokens | null = null;

  private startSession(session: CognitoUserSession) {
    this.UserSession = session;
    this.tokens = {
      idToken: session.getIdToken(),
      accessToken: session.getAccessToken(),
      refreshToken: session.getRefreshToken(),
    };
  }

  public authenticateUser(authenticationDetails: AuthenticationDetails) {
    return new Promise((resolve, reject) => {
      super.authenticateUser(authenticationDetails, {
        onSuccess: (session) => {
          this.startSession(session);
          resolve(null);
        },
        onFailure: (e) => {
          reject(e.message);
        },
      });
    });
  }

  public getUserAttributes(): Promise<User> {
    return new Promise((resolve, reject) => {
      if (this.UserAttributes) {
        resolve(this.UserAttributes);
      }
      super.getUserAttributes((err, attrs) => {
        if (err) {
          reject(err.message);
          return;
        }
        const attributesMap = Object.fromEntries(
          attrs?.map((atr) => [atr.Name, atr.Value]) || []
        );
        const attributes: User = {
          sub: attributesMap.sub,
          email: attributesMap.email,
        };
        this.UserAttributes = attributes;
        resolve(attributes);
      });
    });
  }

  public getSession() {
    return new Promise((resolve, reject) => {
      super.getSession((err: any, session: CognitoUserSession) => {
        if (err) {
          reject(err);
        }
        if (session.isValid()) {
          this.startSession(session);
        }
        resolve(session);
      });
    });
  }

  getUserIdToken() {
    return this.tokens?.idToken.getJwtToken();
  }
}

export default UserInstance;

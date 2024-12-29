import { storage } from '../storage/base';

const AUTH_CREDENTIALS_KEY = 'auth_credentials';

interface Credentials {
  [loginId: string]: string;
}

export class AuthRepository {
  private static instance: AuthRepository;

  private constructor() {
    this.initialize();
  }

  static getInstance(): AuthRepository {
    if (!AuthRepository.instance) {
      AuthRepository.instance = new AuthRepository();
    }
    return AuthRepository.instance;
  }

  private initialize(): void {
    const credentials = this.getCredentials();
    // 初期認証情報を設定
    const initialCredentials = {
      kkkk1111: 'kkkk1111',
      kkkk2222: 'kkkk2222'
    };
    
    // 既存の認証情報と初期認証情報をマージ
    this.setCredentials({
      ...initialCredentials,
      ...credentials
    });
  }

  getCredentials(): Credentials {
    return storage.get<Credentials>(AUTH_CREDENTIALS_KEY) || {};
  }

  setCredentials(credentials: Credentials): void {
    storage.set(AUTH_CREDENTIALS_KEY, credentials);
  }

  verifyCredentials(loginId: string, password: string): boolean {
    const credentials = this.getCredentials();
    return credentials[loginId] === password;
  }

  addCredentials(loginId: string, password: string): void {
    const credentials = this.getCredentials();
    credentials[loginId] = password;
    this.setCredentials(credentials);
  }
}

export const authRepository = AuthRepository.getInstance();
import { storage } from '../storage';
import type { AuthCredentials, AuthState } from './types';

const AUTH_STORAGE_KEY = 'auth-credentials';

const INITIAL_STATE: AuthState = {
  credentials: {
    kkkk1111: 'kkkk1111' // 管理者アカウントを変更
  },
  initialized: false
};

export function getAuthState(): AuthState {
  return storage.get(AUTH_STORAGE_KEY, INITIAL_STATE);
}

export function saveAuthState(state: AuthState): void {
  storage.set(AUTH_STORAGE_KEY, state);
}

export function getCredentials(): AuthCredentials {
  return getAuthState().credentials;
}

export function addCredential(loginId: string, password: string): void {
  const state = getAuthState();
  state.credentials[loginId] = password;
  saveAuthState(state);
}

export function removeCredential(loginId: string): void {
  const state = getAuthState();
  delete state.credentials[loginId];
  saveAuthState(state);
}

export function verifyCredential(loginId: string, password: string): boolean {
  const credentials = getCredentials();
  return credentials[loginId] === password;
}

export function resetAuth(): void {
  saveAuthState(INITIAL_STATE);
}
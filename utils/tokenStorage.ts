import { deleteItemAsync, getItem, getItemAsync, setItemAsync, WHEN_UNLOCKED_THIS_DEVICE_ONLY } from 'expo-secure-store';
import { GithubToken } from '../domain/Github';

const TOKEN_STORAGE_KEY = 'github_token';

export interface TokenStorageInterface {
  saveToken: (token: GithubToken) => Promise<void>;
  getToken: () => Promise<GithubToken | null>;
  getTokenSync: () => GithubToken | null;
  removeToken: () => Promise<void>;
  isTokenExpired: (expiresAt: Date) => boolean;
}

export const TokenStorage: TokenStorageInterface = {
  async saveToken(token: GithubToken): Promise<void> {
    try {
      await setItemAsync(
        TOKEN_STORAGE_KEY,
        JSON.stringify(token),
        {
          // Require authentication (e.g., FaceID, TouchID) to access the tokens
          requireAuthentication: false,
          // Tokens cannot be backed up to cloud storage
          keychainAccessible: WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        }
      );
    } catch (error) {
      console.error('Failed to save tokens securely:', error);
      throw new Error('Failed to save authentication tokens securely');
    }
  },
  async getToken(): Promise<GithubToken | null> {
    try {
      const tokens = await getItemAsync(TOKEN_STORAGE_KEY);
      return tokens ? JSON.parse(tokens) : null;
    } catch (error) {
      console.error('Failed to get tokens from secure storage:', error);
      return null;
    }
  },
  getTokenSync(): GithubToken | null {
    const tokens = getItem(TOKEN_STORAGE_KEY);
    return tokens ? JSON.parse(tokens) : null;
  },
  async removeToken(): Promise<void> {
    try {
      await deleteItemAsync(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove tokens from secure storage:', error);
      throw new Error('Failed to remove authentication tokens');
    }
  },
  isTokenExpired(expiresAt: Date): boolean {
    return new Date() >= expiresAt;
  },
};

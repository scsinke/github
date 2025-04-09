import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGithubService } from './GithubServiceContext';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const githubService = useGithubService();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await githubService.tokenStorage.getToken();
        setIsLoggedIn(!!token && !githubService.tokenStorage.isTokenExpired(token.expiresAt));
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Register the logout callback
    githubService.setLogoutCallback(() => {
      setIsLoggedIn(false);
    });

    checkLoginStatus();
  }, [githubService]);

  const login = async () => {
    try {
      await githubService.login();
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await githubService.logout();
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const value = {
    isLoggedIn,
    isLoading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

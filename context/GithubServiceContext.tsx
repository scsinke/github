import React, { createContext, useContext, ReactNode } from 'react';
import GithubService from '../services/githubService';

// Create a context with a GithubService instance
const GithubServiceContext = createContext<GithubService | undefined>(undefined);

interface GithubServiceProviderProps {
  children: ReactNode;
}

// Create a single instance of GithubService
const githubServiceInstance = new GithubService();

export const GithubServiceProvider = ({ children }: GithubServiceProviderProps) => {
  return (
    <GithubServiceContext.Provider value={githubServiceInstance}>
      {children}
    </GithubServiceContext.Provider>
  );
};

// Custom hook to use the GithubService
export const useGithubService = (): GithubService => {
  const context = useContext(GithubServiceContext);
  if (context === undefined) {
    throw new Error('useGithubService must be used within a GithubServiceProvider');
  }
  return context;
};

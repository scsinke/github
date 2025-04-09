import GithubService from '../../services/githubService';
import { AuthService } from '../../services/authService';
import HTTPService from '../../services/httpService';
import { TokenStorage } from '../../utils/tokenStorage';
import GithubFactory from '../../services/factories/githubFactory';
import { User } from '../../domain/User';
import { Repository } from '../../domain/Repository';

// Mock all dependencies
jest.mock('../../services/authService');
jest.mock('../../services/httpService');
jest.mock('../../utils/tokenStorage');
jest.mock('../../services/factories/githubFactory');

describe('GithubService', () => {
  // Mock implementations
  const mockAuthService = new AuthService() as jest.Mocked<AuthService>;
  const mockHttpService = new HTTPService() as jest.Mocked<HTTPService>;
  const mockTokenStorage = { ...TokenStorage } as jest.Mocked<typeof TokenStorage>;
  
  // Test data
  const mockToken = { accessToken: 'test-token', expiresAt: new Date(Date.now() + 3600000) };
  const mockExpiredToken = { accessToken: 'expired-token', expiresAt: new Date(Date.now() - 3600000) };
  
  const mockAuthResponse = { token: 'test-token', state: 'test-state' };
  
  const mockGithubUser = {
    name: 'Test User',
    avatar_url: 'https://example.com/avatar.png',
    id: 12345,
    followers: 10,
    following: 20
  };
  
  const mockUser: User = {
    name: 'Test User',
    avatarUrl: 'https://example.com/avatar.png',
    id: 12345,
    numberOfFollowers: 10,
    numberOfFollowing: 20
  };
  
  const mockGithubRepos = [
    {
      id: 1,
      name: 'repo1',
      description: 'Test repo 1'
    },
    {
      id: 2,
      name: 'repo2',
      description: 'Test repo 2'
    }
  ];
  
  const mockRepos: Repository[] = [
    {
      id: 1,
      name: 'repo1',
      description: 'Test repo 1'
    },
    {
      id: 2,
      name: 'repo2',
      description: 'Test repo 2'
    }
  ];

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    (mockTokenStorage.getTokenSync as jest.Mock).mockReturnValue(null);
    (mockTokenStorage.isTokenExpired as jest.Mock).mockReturnValue(false);
    (mockTokenStorage.saveToken as jest.Mock).mockResolvedValue(undefined);
    (mockTokenStorage.removeToken as jest.Mock).mockResolvedValue(undefined);
    
    (mockAuthService.login as jest.Mock).mockResolvedValue(mockAuthResponse);
    
    (mockHttpService.authorizedUser as jest.Mock).mockResolvedValue(mockGithubUser);
    (mockHttpService.getRepositories as jest.Mock).mockResolvedValue(mockGithubRepos);
    (mockHttpService.setBearerToken as jest.Mock).mockImplementation(() => {});
    
    (GithubFactory.createUser as jest.Mock).mockReturnValue(mockUser);
    (GithubFactory.createRepositories as jest.Mock).mockReturnValue(mockRepos);
  });

  describe('constructor', () => {
    it('should initialize with dependencies and set bearer token if token exists', () => {
      // Setup
      (mockTokenStorage.getTokenSync as jest.Mock).mockReturnValue(mockToken);
      
      // Execute
      const service = new GithubService(mockAuthService, mockHttpService, mockTokenStorage);
      
      // Verify
      expect(service.token).toEqual(mockToken);
      expect(mockHttpService.setBearerToken).toHaveBeenCalledWith(mockToken.accessToken);
    });
    
    it('should initialize with dependencies and not set bearer token if no token exists', () => {
      // Setup
      (mockTokenStorage.getTokenSync as jest.Mock).mockReturnValue(null);
      
      // Execute
      const service = new GithubService(mockAuthService, mockHttpService, mockTokenStorage);
      
      // Verify
      expect(service.token).toBeUndefined();
      expect(mockHttpService.setBearerToken).toHaveBeenCalledWith(undefined);
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile when token is valid', async () => {
      // Setup
      const service = new GithubService(mockAuthService, mockHttpService, mockTokenStorage);
      service.token = mockToken;
      
      // Execute
      const result = await service.getUserProfile();
      
      // Verify
      expect(mockTokenStorage.isTokenExpired).toHaveBeenCalledWith(mockToken.expiresAt);
      expect(mockHttpService.authorizedUser).toHaveBeenCalledWith(false);
      expect(GithubFactory.createUser).toHaveBeenCalledWith(mockGithubUser);
      expect(result).toEqual(mockUser);
    });
    
    it('should logout and return undefined when token is expired', async () => {
      // Setup
      const service = new GithubService(mockAuthService, mockHttpService, mockTokenStorage);
      service.token = mockExpiredToken;
      (mockTokenStorage.isTokenExpired as jest.Mock).mockReturnValue(true);
      
      // Execute
      const result = await service.getUserProfile();
      
      // Verify
      expect(mockTokenStorage.isTokenExpired).toHaveBeenCalledWith(mockExpiredToken.expiresAt);
      expect(mockTokenStorage.removeToken).toHaveBeenCalled();
      expect(mockHttpService.setBearerToken).toHaveBeenCalledWith(undefined);
      expect(result).toBeUndefined();
    });
    
    it('should pass ignoreCache parameter to HTTP service', async () => {
      // Setup
      const service = new GithubService(mockAuthService, mockHttpService, mockTokenStorage);
      service.token = mockToken;
      
      // Execute
      await service.getUserProfile(true);
      
      // Verify
      expect(mockHttpService.authorizedUser).toHaveBeenCalledWith(true);
    });
  });

  describe('getRepositories', () => {
    it('should return repositories when token is valid', async () => {
      // Setup
      const service = new GithubService(mockAuthService, mockHttpService, mockTokenStorage);
      service.token = mockToken;
      
      // Execute
      const result = await service.getRepositories();
      
      // Verify
      expect(mockTokenStorage.isTokenExpired).toHaveBeenCalledWith(mockToken.expiresAt);
      expect(mockHttpService.getRepositories).toHaveBeenCalledWith(false);
      expect(GithubFactory.createRepositories).toHaveBeenCalledWith(mockGithubRepos);
      expect(result).toEqual(mockRepos);
    });
    
    it('should logout and return undefined when token is expired', async () => {
      // Setup
      const service = new GithubService(mockAuthService, mockHttpService, mockTokenStorage);
      service.token = mockExpiredToken;
      (mockTokenStorage.isTokenExpired as jest.Mock).mockReturnValue(true);
      
      // Execute
      const result = await service.getRepositories();
      
      // Verify
      expect(mockTokenStorage.isTokenExpired).toHaveBeenCalledWith(mockExpiredToken.expiresAt);
      expect(mockTokenStorage.removeToken).toHaveBeenCalled();
      expect(mockHttpService.setBearerToken).toHaveBeenCalledWith(undefined);
      expect(result).toBeUndefined();
    });
    
    it('should pass ignoreCache parameter to HTTP service', async () => {
      // Setup
      const service = new GithubService(mockAuthService, mockHttpService, mockTokenStorage);
      service.token = mockToken;
      
      // Execute
      await service.getRepositories(true);
      
      // Verify
      expect(mockHttpService.getRepositories).toHaveBeenCalledWith(true);
    });
  });

  describe('login', () => {
    it('should authenticate, save token, and set bearer token', async () => {
      // Setup
      const service = new GithubService(mockAuthService, mockHttpService, mockTokenStorage);
      
      // Execute
      await service.login();
      
      // Verify
      expect(mockAuthService.login).toHaveBeenCalled();
      expect(mockTokenStorage.saveToken).toHaveBeenCalled();
      expect(mockHttpService.setBearerToken).toHaveBeenCalledWith(mockAuthResponse.token);
      
      // Check that token was created with correct expiry (approximately 7 hours from now)
      expect(service.token).toBeDefined();
      if (service.token) {
        expect(service.token.accessToken).toBe(mockAuthResponse.token);
        
        const now = new Date();
        const expiryTime = service.token.expiresAt.getTime();
        const nowTime = now.getTime();
        const diff = expiryTime - nowTime;
        
        // Should be approximately 7 hours (with some tolerance for test execution time)
        expect(diff).toBeGreaterThan(6.9 * 60 * 60 * 1000);
        expect(diff).toBeLessThan(7.1 * 60 * 60 * 1000);
      }
    });
  });

  describe('logout', () => {
    it('should remove token, clear token property, and reset bearer token', async () => {
      // Setup
      const service = new GithubService(mockAuthService, mockHttpService, mockTokenStorage);
      service.token = mockToken;
      
      // Execute
      await service.logout();
      
      // Verify
      expect(mockTokenStorage.removeToken).toHaveBeenCalled();
      expect(service.token).toBeUndefined();
      expect(mockHttpService.setBearerToken).toHaveBeenCalledWith(undefined);
    });
    
    it('should call onLogout callback if set', async () => {
      // Setup
      const service = new GithubService(mockAuthService, mockHttpService, mockTokenStorage);
      service.token = mockToken;
      const mockCallback = jest.fn();
      service.setLogoutCallback(mockCallback);
      
      // Execute
      await service.logout();
      
      // Verify
      expect(mockCallback).toHaveBeenCalled();
    });
  });
});

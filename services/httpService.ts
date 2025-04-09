import { AuthenticatedUser, Respositories } from "./factories/githubFactory";
import cacheService, { ICacheService } from "./cacheService";

export interface IHTTPService {
    setBearerToken(bearerToken?: string): void;
    authorizedUser(ignoreCache?: boolean): Promise<AuthenticatedUser>;
    getRepositories(ignoreCache?: boolean): Promise<Respositories>;
}

export default class HTTPService implements IHTTPService {
    bearerToken?: string;
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
    private readonly USER_CACHE_KEY = 'github:user';
    private readonly REPOS_CACHE_KEY = 'github:repositories';
    private cacheService: ICacheService;

    constructor(cacheServiceInstance: ICacheService = cacheService) {
        this.cacheService = cacheServiceInstance;
    }

    setBearerToken(bearerToken?: string): void {
        this.bearerToken = bearerToken;
    }

    async authorizedUser(ignoreCache: boolean = false): Promise<AuthenticatedUser> {
        if (!this.bearerToken) {
            throw new Error('No authentication token available');
        }
        
        // Return cached data if available and not expired
        if (!ignoreCache) {
            const isExpired = await this.cacheService.isExpired(this.USER_CACHE_KEY, this.CACHE_TTL);
            if (!isExpired) {
                const cachedUser = await this.cacheService.get<AuthenticatedUser>(this.USER_CACHE_KEY);
                if (cachedUser) {
                    return cachedUser;
                }
            }
        }
        
        const response = await fetch("https://api.github.com/user", {
            headers: {
                'Authorization': `token ${this.bearerToken}`,
                'X-GitHub-Api-Version': '2022-11-28',
                'Accept': 'application/vnd.github+json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user profile: ${response.statusText}`);
        }

        const user = await response.json() as AuthenticatedUser;
        
        // Update cache
        await this.cacheService.set(this.USER_CACHE_KEY, user);
        
        return user;
    }

    async getRepositories(ignoreCache: boolean = false): Promise<Respositories> {
        if (!this.bearerToken) {
            throw new Error('No authentication token available');
        }
        
        // Return cached data if available and not expired
        if (!ignoreCache) {
            const isExpired = await this.cacheService.isExpired(this.REPOS_CACHE_KEY, this.CACHE_TTL);
            if (!isExpired) {
                const cachedRepos = await this.cacheService.get<Respositories>(this.REPOS_CACHE_KEY);
                if (cachedRepos) {
                    return cachedRepos;
                }
            }
        }
        
        const response = await fetch("https://api.github.com/user/repos", {
            headers: {
                'Authorization': `token ${this.bearerToken}`,
                'X-GitHub-Api-Version': '2022-11-28',
                'Accept': 'application/vnd.github+json' 
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch repositories: ${response.statusText}`);
        }

        const repos = await response.json();
        const repositories = Array.isArray(repos) ? repos : [];
        
        // Update cache
        await this.cacheService.set(this.REPOS_CACHE_KEY, repositories);
        
        return repositories;
    }
}

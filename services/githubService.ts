import { TokenStorage, TokenStorageInterface } from "../utils/tokenStorage";
import GithubFactory from "./factories/githubFactory";
import { AuthService, AuthServiceInterface } from './authService';
import { GithubToken } from "../domain/Github";
import HTTPService, { IHTTPService } from "./httpService";


class GithubService {
  token?: GithubToken
  authService: AuthServiceInterface
  tokenStorage: TokenStorageInterface
  httpService: IHTTPService
  onLogout?: () => void

  constructor(
    authService: AuthServiceInterface = new AuthService(),
    httpService: IHTTPService = new HTTPService(),
    tokenStorage: TokenStorageInterface = TokenStorage
  ) {
    this.token = tokenStorage.getTokenSync() || undefined
    this.authService = authService
    this.tokenStorage = tokenStorage
    this.httpService = httpService
    this.httpService.setBearerToken(this.token?.accessToken)
  }

  setLogoutCallback(callback: () => void) {
    this.onLogout = callback;
  }

  async getUserProfile(ignoreCache: boolean = false) {
    if (this.token && this.tokenStorage.isTokenExpired(this.token.expiresAt)) {
      await this.logout();
      return
    }

    const user = await this.httpService.authorizedUser(ignoreCache);
    return GithubFactory.createUser(user)
  }

  async getRepositories(ignoreCache: boolean = false) {
    if (this.token && this.tokenStorage.isTokenExpired(this.token.expiresAt)) {
      await this.logout();
      return
    }

    const repositories = await this.httpService.getRepositories(ignoreCache);
    return GithubFactory.createRepositories(repositories);
  }

  async login() {
    const response = await this.authService.login()
    const expiryDate = new Date()
    expiryDate.setHours(expiryDate.getHours() + 7);
    this.token = { accessToken: response.token, expiresAt: expiryDate }
    await this.tokenStorage.saveToken(this.token)
    this.httpService.setBearerToken(this.token?.accessToken)
  }

  async logout() {
    await this.tokenStorage.removeToken()
    this.token = undefined
    this.httpService.setBearerToken(undefined)
    
    // Notify any listeners that logout has occurred
    if (this.onLogout) {
      this.onLogout();
    }
  }
}

export default GithubService;

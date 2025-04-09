import { loadAsync, makeRedirectUri, ResponseType } from "expo-auth-session";
import { ENV } from "../config/env";

export interface AuthServiceInterface {
    login(): Promise<AuthResponse>
}

const githubConfig = {
    clientId: ENV.GITHUB.CLIENT_ID,
    clientSecret: ENV.GITHUB.CLIENT_SECRET,
    scopes: ['user', 'repo'],
    discovery: {
        authorizationEndpoint: 'https://github.com/login/oauth/authorize',
        tokenEndpoint: 'https://github.com/login/oauth/access_token',
        revocationEndpoint: `https://github.com/settings/connections/applications/${ENV.GITHUB.CLIENT_ID}`,
    },
};

export class AuthService implements AuthServiceInterface {
    async login(): Promise<AuthResponse> {
        const redirectUri = makeRedirectUri({
            path: "callback",
        });

        const request = await loadAsync({
            clientId: githubConfig.clientId,
            responseType: ResponseType.Code,
            scopes: githubConfig.scopes,
            redirectUri,
            usePKCE: true,
        }, githubConfig.discovery);

        const response = await request.promptAsync(githubConfig.discovery);

        if (response.type === 'success') {
            // Exchange the code for an access token
            const accessToken = await this.exchangeCodeForToken(
                response.params.code,
                redirectUri
            );
            
            return {
                token: accessToken,
                state: response.params.state
            };
        } else {
            throw new Error('Failed to login');
        }
    }

    private async exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
        const tokenUrl = githubConfig.discovery.tokenEndpoint;
        
        const params = new URLSearchParams({
            client_id: githubConfig.clientId,
            client_secret: githubConfig.clientSecret,
            code: code,
            redirect_uri: redirectUri,
        });

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Failed to exchange code for token: ${response.status} ${response.statusText} - ${errorData}`);
        }

        const data = await response.json();
        
        if (!data.access_token) {
            throw new Error(`No access token returned: ${JSON.stringify(data)}`);
        }
        
        return data.access_token;
    }
}

export interface AuthResponse {
    token: string
    state: string
}
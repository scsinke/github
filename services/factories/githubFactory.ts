import { Repository } from "../../domain/Repository";
import { User } from "../../domain/User";
import { Endpoints } from "@octokit/types";

export type AuthenticatedUser = Endpoints["GET /user"]["response"]["data"]
export type Respositories = Endpoints["GET /user/repos"]["response"]["data"]

export default class GithubFactory {
    static createUser(user: AuthenticatedUser): User {
        return {
            name: user.name ?? '',
            avatarUrl: user.avatar_url,
            id: user.id,
            numberOfFollowers: user.followers,
            numberOfFollowing: user.following
        }
    }

    static createRepositories(repositories: Respositories): Repository[] {
        const converted = repositories.map(repo => {
            return {
                id: repo.id,
                name: repo.name,
                description: repo.description
            } as Repository
        });

        return converted;
    }

}

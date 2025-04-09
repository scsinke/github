# GitHub Mobile App

A cross-platform mobile application for browsing GitHub repositories and viewing user profiles, built with Expo and TypeScript.

## Architectural Overview

This project is structured according to Clean Architecture principles, ensuring a clear separation of concerns and testability:

- **Domain Layer**: Defines business logic and entity models (e.g., `User`, `Repository`, `GithubToken`) as pure TypeScript interfaces, fully decoupled from frameworks.
- **Service Layer**: Implements business logic, interacts with external APIs, and applies the Factory pattern to transform API responses into domain models. Includes services for authentication, HTTP requests, and GitHub API access.
- **Presentation Layer**: Contains all UI components and screens, organized by feature. Relies on React Native components and Expo libraries.

**Dependency injection** is used throughout the service layer (constructor-based), making it easy to swap or mock dependencies for testing.

**State management** is handled via the React Context API, with dedicated contexts for authentication and GitHub service access.

## Technology Choices

- **Expo Framework**: Chosen to use as many expo libraries as possible. This because using expo is the preferred way for cross platform development.
- **Expo Libraries**:
  - `expo-auth-session` for GitHub OAuth authentication
  - `expo-secure-store` for secure token storage
  - `expo-file-system` for persistent, disk-based API response caching
  - `expo-crypto` for secure hashing of cache keys
  - `@expo/vector-icons` for UI icons
- **Navigation**: Utilizes `@react-navigation/native` and `@react-navigation/bottom-tabs` for intuitive, tab-based navigation between main screens. I decided on this approach because the expo library was based on file based routing in the examples.
- **Data Management**: Implements a custom caching layer using Expo's FileSystem for persistent storage, with a TTL-based invalidation strategy (default: 5 minutes). Note: React Native's fetch API also supports request caching if servers set appropriate headers, which I generally prefer.

## Testing

- **Jest** is used as the testing framework, with unit tests for core business logic.
- All external dependencies are mocked to ensure tests are reliable and isolated.
- Test coverage focuses on critical service functionality.

## Possible improvement

- Implement API generation using OpenAPI Generator or using grpc. This would reduce risk of errors in the API code and make it easier to update the API.
- Currently errors are not handled appropriately. This could be improved for a better user experience.
- Currently the user interface is very bare. This could be improved by adding more UI elements and better styling. I decided on the current approach to show more the architectural focus.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with GitHub OAuth credentials:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```
4. Start the development server: `npm start`
5. Run on iOS: `npm run ios`
6. Run on Android: `npm run android`

## Testing

Run the test suite: `npm test`

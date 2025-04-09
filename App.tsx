import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TabNavigator from './presentation/components/TabNavigator';
import LoginScreen from './presentation/Screens/LoginScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GithubServiceProvider } from './context/GithubServiceContext';

export default function App() {
  return (
    <GithubServiceProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GithubServiceProvider>
  );
}

const AppContent = () => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      {isLoggedIn ? <TabNavigator /> : <LoginScreen />}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});

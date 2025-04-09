import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, ScrollView, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { User } from '../../domain/User';
import { useAuth } from '../../context/AuthContext';
import { useGithubService } from '../../context/GithubServiceContext';

const ProfileScreen = () => {
  const [profile, setProfile] = useState<User | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const githubService = useGithubService();

  const fetchProfile = async (ignoreCache: boolean = false) => {
    try {
      const userProfile = await githubService.getUserProfile(ignoreCache);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [githubService]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GitHub Profile</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {profile ? (
            <View style={styles.profileContainer}>
              <Image
                source={{ uri: profile.avatarUrl }}
                style={styles.avatar}
              />
              <Text style={styles.profileText}>Name: {profile.name}</Text>
              <Text style={styles.profileText}>Followers: {profile.numberOfFollowers}</Text>
              <Text style={styles.profileText}>Following: {profile.numberOfFollowing}</Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>No profile information available</Text>
          )}
          <View style={styles.buttonContainer}>
            <Button 
              title="Logout" 
              onPress={handleLogout}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileContainer: {
    width: '100%',
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 15,
  },
  profileText: {
    fontSize: 16,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
});

export default ProfileScreen;

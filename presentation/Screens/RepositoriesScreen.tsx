import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, TextInput } from 'react-native';
import { useGithubService } from '../../context/GithubServiceContext';
import { Repository } from '../../domain/Repository';

const RepositoriesScreen = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [filteredRepositories, setFilteredRepositories] = useState<Repository[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const githubService = useGithubService();

  const fetchRepositories = async (ignoreCache: boolean = false) => {
    try {
      const repos = await githubService.getRepositories(ignoreCache);
      setRepositories(repos ?? []);
      setFilteredRepositories(repos ?? []);
    } catch (error) {
      console.error('Error fetching repositories:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, [githubService]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRepositories(repositories);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = repositories.filter(
        repo => 
          repo.name.toLowerCase().includes(lowercasedQuery) || 
          (repo.description && repo.description.toLowerCase().includes(lowercasedQuery))
      );
      setFilteredRepositories(filtered);
    }
  }, [searchQuery, repositories]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRepositories(true);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Repositories</Text>
      
      {!loading && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search repositories..."
            value={searchQuery}
            onChangeText={handleSearch}
            clearButtonMode="while-editing"
          />
        </View>
      )}
      
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredRepositories.length > 0 ? (
            filteredRepositories.map((repo) => (
              <View key={repo.id} style={styles.repoItem}>
                <Text style={styles.repoName}>{repo.name}</Text>
                <Text>{repo.description || 'No description'}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              {searchQuery.trim() !== '' 
                ? 'No repositories match your search' 
                : 'No repositories found'}
            </Text>
          )}
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
  searchContainer: {
    marginBottom: 15,
    width: '100%',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  repoItem: {
    width: '100%',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  repoName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default RepositoriesScreen;

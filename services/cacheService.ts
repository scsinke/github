import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

export interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, data: T): Promise<void>;
  invalidate(key: string): Promise<void>;
  invalidateAll(): Promise<void>;
  isExpired(key: string, ttl: number): Promise<boolean>;
}

export class CacheService implements ICacheService {
  private readonly CACHE_DIR: string;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor() {
    // Create a dedicated cache directory
    this.CACHE_DIR = `${FileSystem.cacheDirectory}app-cache/`;
    this.ensureCacheDirectory();
  }

  private async ensureCacheDirectory(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.CACHE_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Error creating cache directory:', error);
    }
  }

  private async getCacheFilePath(key: string): Promise<string> {
    // Use crypto to hash the key for a safe filename
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      key
    );
    return `${this.CACHE_DIR}${hash}.json`;
  }

  /**
   * Get cached data for a key
   * @param key Cache key
   * @returns The cached data or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const filePath = await this.getCacheFilePath(key);
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (!fileInfo.exists) {
        return null;
      }
      
      const content = await FileSystem.readAsStringAsync(filePath);
      const item = JSON.parse(content) as CacheItem<T>;
      return item.data;
    } catch (error) {
      console.error('Error retrieving from cache:', error);
      return null;
    }
  }

  /**
   * Get cached item with metadata for a key
   * @param key Cache key
   * @returns The cached item with metadata or null if not found
   */
  async getWithMetadata<T>(key: string): Promise<CacheItem<T> | null> {
    try {
      const filePath = await this.getCacheFilePath(key);
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (!fileInfo.exists) {
        return null;
      }
      
      const content = await FileSystem.readAsStringAsync(filePath);
      return JSON.parse(content) as CacheItem<T>;
    } catch (error) {
      console.error('Error retrieving from cache with metadata:', error);
      return null;
    }
  }

  /**
   * Set data in cache for a key
   * @param key Cache key
   * @param data Data to cache
   */
  async set<T>(key: string, data: T): Promise<void> {
    try {
      await this.ensureCacheDirectory();
      const filePath = await this.getCacheFilePath(key);
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now()
      };
      
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(item));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  /**
   * Invalidate cache for a specific key
   * @param key Cache key to invalidate
   */
  async invalidate(key: string): Promise<void> {
    try {
      const filePath = await this.getCacheFilePath(key);
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(filePath);
      }
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  }

  /**
   * Invalidate all cached data
   */
  async invalidateAll(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.CACHE_DIR);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(this.CACHE_DIR, { idempotent: true });
        await this.ensureCacheDirectory();
      }
    } catch (error) {
      console.error('Error invalidating all cache:', error);
    }
  }

  /**
   * Check if cached data for a key is expired
   * @param key Cache key
   * @param ttl Time to live in milliseconds (default: 5 minutes)
   * @returns True if expired or not found, false otherwise
   */
  async isExpired(key: string, ttl: number = this.DEFAULT_TTL): Promise<boolean> {
    try {
      const item = await this.getWithMetadata<any>(key);
      
      if (!item) {
        return true;
      }
      
      const now = Date.now();
      return now - item.timestamp > ttl;
    } catch (error) {
      console.error('Error checking cache expiration:', error);
      return true;
    }
  }
}

// Export a singleton instance
export const cacheService = new CacheService();
export default cacheService;

// Mock expo modules that might cause issues in tests
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://document-directory/',
  cacheDirectory: 'file://cache-directory/',
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true })),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  readAsStringAsync: jest.fn(() => Promise.resolve('{}')),
  deleteAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: {
    SHA256: 'SHA-256',
  },
  digestStringAsync: jest.fn(() => Promise.resolve('mocked-hash')),
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => null),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'whenUnlockedThisDeviceOnly'
}));

// Mock fetch
global.fetch = jest.fn();

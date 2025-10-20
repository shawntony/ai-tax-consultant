/**
 * Unit Tests for Encryption Utility
 *
 * @file encryption.test.js
 * @version 1.0.0
 * @date 2024-10-18
 */

import {
  encrypt,
  decrypt,
  setSecureItem,
  getSecureItem,
  removeSecureItem,
  clearSecureStorage,
  testEncryption,
  storeAPIKey,
  getAPIKey,
  removeAPIKey,
  hasAPIKey,
  getAPIKeysStatus,
  maskAPIKey,
  resetEncryptionKey
} from './encryption';

describe('Encryption Utility', () => {

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('encrypt() and decrypt()', () => {
    test('should encrypt and decrypt text correctly', () => {
      const plaintext = 'Hello, World!';
      const encrypted = encrypt(plaintext);

      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toBe(plaintext);

      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    test('should encrypt Korean text correctly', () => {
      const plaintext = '안녕하세요, 세금 계산기입니다';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    test('should handle special characters', () => {
      const plaintext = 'API Key: sk-1234!@#$%^&*()_+-={}[]|:";\'<>?,./';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    test('should encrypt JSON stringified objects', () => {
      const obj = {
        provider: 'claude',
        apiKey: 'sk-1234567890',
        timestamp: new Date().toISOString()
      };
      const plaintext = JSON.stringify(obj);
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
      expect(JSON.parse(decrypted)).toEqual(obj);
    });

    test('should throw error when encrypting empty string', () => {
      expect(() => encrypt('')).toThrow();
      expect(() => encrypt(null)).toThrow();
      expect(() => encrypt(undefined)).toThrow();
    });

    test('should throw error when decrypting empty string', () => {
      expect(() => decrypt('')).toThrow();
      expect(() => decrypt(null)).toThrow();
    });

    test('should throw error when decrypting invalid ciphertext', () => {
      expect(() => decrypt('invalid-ciphertext')).toThrow();
    });

    test('should produce different ciphertext for same plaintext', () => {
      const plaintext = 'Test Data';
      const encrypted1 = encrypt(plaintext);

      // Reset encryption key to get different ciphertext
      resetEncryptionKey();

      const encrypted2 = encrypt(plaintext);

      // Different ciphertexts but same decrypted value
      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('setSecureItem() and getSecureItem()', () => {
    test('should store and retrieve string data', () => {
      const key = 'test_string';
      const value = 'Hello, localStorage!';

      setSecureItem(key, value);
      const retrieved = getSecureItem(key);

      expect(retrieved).toBe(value);
    });

    test('should store and retrieve object data', () => {
      const key = 'test_object';
      const value = {
        name: 'AI Tax Consultant',
        version: '1.0.0',
        features: ['inheritance', 'gift', 'capital-gains']
      };

      setSecureItem(key, value);
      const retrieved = getSecureItem(key);

      expect(retrieved).toEqual(value);
    });

    test('should store and retrieve array data', () => {
      const key = 'test_array';
      const value = [1, 2, 3, 4, 5];

      setSecureItem(key, value);
      const retrieved = getSecureItem(key);

      expect(retrieved).toEqual(value);
    });

    test('should return null for non-existent key', () => {
      const retrieved = getSecureItem('non_existent_key');
      expect(retrieved).toBeNull();
    });

    test('should handle Korean data', () => {
      const key = 'test_korean';
      const value = {
        title: '양도소득세 계산기',
        description: '부동산 양도 시 세금 계산'
      };

      setSecureItem(key, value);
      const retrieved = getSecureItem(key);

      expect(retrieved).toEqual(value);
    });

    test('should encrypt data in localStorage', () => {
      const key = 'test_encrypted';
      const value = 'Sensitive Data';

      setSecureItem(key, value);

      // Raw localStorage value should be encrypted (not equal to original)
      const rawValue = localStorage.getItem(key);
      expect(rawValue).not.toBe(value);
      expect(rawValue).not.toContain('Sensitive');
    });
  });

  describe('removeSecureItem()', () => {
    test('should remove item from storage', () => {
      const key = 'test_remove';
      const value = 'Data to remove';

      setSecureItem(key, value);
      expect(getSecureItem(key)).toBe(value);

      removeSecureItem(key);
      expect(getSecureItem(key)).toBeNull();
    });

    test('should not throw error when removing non-existent key', () => {
      expect(() => removeSecureItem('non_existent')).not.toThrow();
    });
  });

  describe('clearSecureStorage()', () => {
    test('should clear all items except encryption key', () => {
      setSecureItem('key1', 'value1');
      setSecureItem('key2', 'value2');
      setSecureItem('key3', 'value3');

      expect(getSecureItem('key1')).toBe('value1');

      clearSecureStorage();

      expect(getSecureItem('key1')).toBeNull();
      expect(getSecureItem('key2')).toBeNull();
      expect(getSecureItem('key3')).toBeNull();

      // Encryption key should still exist
      expect(localStorage.getItem('__aitax_enc_key__')).toBeTruthy();
    });
  });

  describe('testEncryption()', () => {
    test('should return true for functional encryption', () => {
      const result = testEncryption();
      expect(result).toBe(true);
    });
  });

  describe('API Keys Storage', () => {
    describe('storeAPIKey()', () => {
      test('should store Claude API key', () => {
        const apiKey = 'sk-ant-1234567890';
        storeAPIKey('claude', apiKey);

        const retrieved = getAPIKey('claude');
        expect(retrieved).toBe(apiKey);
      });

      test('should store ChatGPT API key', () => {
        const apiKey = 'sk-1234567890abcdef';
        storeAPIKey('chatgpt', apiKey);

        const retrieved = getAPIKey('chatgpt');
        expect(retrieved).toBe(apiKey);
      });

      test('should store Perplexity API key', () => {
        const apiKey = 'pplx-1234567890';
        storeAPIKey('perplexity', apiKey);

        const retrieved = getAPIKey('perplexity');
        expect(retrieved).toBe(apiKey);
      });

      test('should throw error for invalid provider', () => {
        expect(() => storeAPIKey('invalid', 'key')).toThrow();
      });

      test('should throw error for invalid API key', () => {
        expect(() => storeAPIKey('claude', '')).toThrow();
        expect(() => storeAPIKey('claude', null)).toThrow();
        expect(() => storeAPIKey('claude', 123)).toThrow();
      });

      test('should handle case-insensitive provider names', () => {
        storeAPIKey('CLAUDE', 'sk-test');
        expect(getAPIKey('claude')).toBe('sk-test');
      });
    });

    describe('getAPIKey()', () => {
      test('should return null for non-existent key', () => {
        const result = getAPIKey('claude');
        expect(result).toBeNull();
      });

      test('should return null for invalid provider', () => {
        const result = getAPIKey('invalid');
        expect(result).toBeNull();
      });
    });

    describe('removeAPIKey()', () => {
      test('should remove stored API key', () => {
        storeAPIKey('claude', 'sk-test-key');
        expect(hasAPIKey('claude')).toBe(true);

        removeAPIKey('claude');
        expect(hasAPIKey('claude')).toBe(false);
      });

      test('should not throw error for non-existent key', () => {
        expect(() => removeAPIKey('chatgpt')).not.toThrow();
      });
    });

    describe('hasAPIKey()', () => {
      test('should return true when key exists', () => {
        storeAPIKey('claude', 'sk-test');
        expect(hasAPIKey('claude')).toBe(true);
      });

      test('should return false when key does not exist', () => {
        expect(hasAPIKey('chatgpt')).toBe(false);
      });
    });

    describe('getAPIKeysStatus()', () => {
      test('should return status for all providers', () => {
        const status = getAPIKeysStatus();

        expect(status).toHaveProperty('claude');
        expect(status).toHaveProperty('chatgpt');
        expect(status).toHaveProperty('perplexity');
        expect(status.claude).toBe(false);
        expect(status.chatgpt).toBe(false);
        expect(status.perplexity).toBe(false);
      });

      test('should reflect actual stored keys', () => {
        storeAPIKey('claude', 'sk-test1');
        storeAPIKey('perplexity', 'pplx-test');

        const status = getAPIKeysStatus();

        expect(status.claude).toBe(true);
        expect(status.chatgpt).toBe(false);
        expect(status.perplexity).toBe(true);
      });
    });

    describe('maskAPIKey()', () => {
      test('should mask long API key', () => {
        const apiKey = 'sk-ant-1234567890abcdef';
        const masked = maskAPIKey(apiKey);

        expect(masked).toBe('sk-ant-1...cdef');
        expect(masked).not.toContain('234567890ab');
      });

      test('should mask short API key', () => {
        const apiKey = 'shortkey';
        const masked = maskAPIKey(apiKey);

        expect(masked).toBe('••••••••••••');
      });

      test('should handle empty/null API key', () => {
        expect(maskAPIKey('')).toBe('••••••••••••');
        expect(maskAPIKey(null)).toBe('••••••••••••');
      });

      test('should show first 8 and last 4 characters', () => {
        const apiKey = 'sk-1234567890abcdefghijklmn';
        const masked = maskAPIKey(apiKey);

        expect(masked.startsWith('sk-12345')).toBe(true);
        expect(masked.endsWith('klmn')).toBe(true);
        expect(masked).toContain('...');
      });
    });
  });

  describe('Security Tests', () => {
    test('should not expose plaintext in localStorage', () => {
      const sensitiveData = 'sk-ant-my-secret-api-key';
      storeAPIKey('claude', sensitiveData);

      // Check raw localStorage
      const allKeys = Object.keys(localStorage);
      const allValues = allKeys.map(key => localStorage.getItem(key));

      // No value should contain the plaintext
      allValues.forEach(value => {
        expect(value).not.toContain('my-secret-api-key');
      });
    });

    test('should use unique encryption for each session', () => {
      const data = 'Test Data';

      setSecureItem('test1', data);
      const encrypted1 = localStorage.getItem('test1');

      // Reset key
      resetEncryptionKey();

      setSecureItem('test2', data);
      const encrypted2 = localStorage.getItem('test2');

      // Different encrypted values
      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long strings', () => {
      const longString = 'A'.repeat(10000);
      const encrypted = encrypt(longString);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(longString);
    });

    test('should handle unicode characters', () => {
      const unicode = '😀😁😂🤣😃😄😅😆😉😊';
      const encrypted = encrypt(unicode);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(unicode);
    });

    test('should handle newlines and tabs', () => {
      const text = 'Line1\nLine2\tTabbed\r\nWindows';
      const encrypted = encrypt(text);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(text);
    });

    test('should handle complex nested objects', () => {
      const complexObj = {
        level1: {
          level2: {
            level3: {
              array: [1, 2, 3],
              string: 'nested',
              number: 123.45,
              boolean: true,
              null: null
            }
          }
        }
      };

      setSecureItem('complex', complexObj);
      const retrieved = getSecureItem('complex');

      expect(retrieved).toEqual(complexObj);
    });
  });

  describe('Persistence Tests', () => {
    test('should persist data across multiple get/set operations', () => {
      storeAPIKey('claude', 'key1');
      storeAPIKey('chatgpt', 'key2');
      storeAPIKey('perplexity', 'key3');

      expect(getAPIKey('claude')).toBe('key1');
      expect(getAPIKey('chatgpt')).toBe('key2');
      expect(getAPIKey('perplexity')).toBe('key3');

      // Update one key
      storeAPIKey('claude', 'key1-updated');

      expect(getAPIKey('claude')).toBe('key1-updated');
      expect(getAPIKey('chatgpt')).toBe('key2'); // Others unchanged
      expect(getAPIKey('perplexity')).toBe('key3');
    });
  });

});

/**
 * SecureStorage Unit Tests
 * @jest-environment jsdom
 */

import {
  SecureStorage,
  secureStorage,
  encrypt,
  decrypt,
  saveApiKey,
  getApiKey,
  removeApiKey,
  removeAllApiKeys,
  maskApiKey,
  DEFAULT_EXPIRY,
  STORAGE_PREFIX
} from './secureStorage.js'

// Mock navigator for Node.js environment
global.navigator = {
  userAgent: 'Mozilla/5.0 (Test Browser)',
  language: 'en-US'
}

describe('SecureStorage - Encryption/Decryption', () => {
  describe('encrypt() and decrypt()', () => {
    test('Should encrypt and decrypt data successfully', () => {
      const original = 'test data'
      const encrypted = encrypt(original)

      expect(encrypted).not.toBe(original)
      expect(encrypted.length).toBeGreaterThan(0)

      const decrypted = decrypt(encrypted)
      expect(decrypted).toBe(original)
    })

    test('Should work with custom encryption key', () => {
      const data = 'secret message'
      const customKey = 'my-custom-key-123'

      const encrypted = encrypt(data, customKey)
      const decrypted = decrypt(encrypted, customKey)

      expect(decrypted).toBe(data)
    })

    test('Should fail to decrypt with wrong key', () => {
      const data = 'protected data'
      const encrypted = encrypt(data, 'key1')

      expect(() => {
        decrypt(encrypted, 'key2')
      }).toThrow()
    })

    test('Should handle JSON objects', () => {
      const obj = { name: 'test', value: 123, nested: { key: 'value' } }
      const jsonStr = JSON.stringify(obj)

      const encrypted = encrypt(jsonStr)
      const decrypted = decrypt(encrypted)
      const parsed = JSON.parse(decrypted)

      expect(parsed).toEqual(obj)
    })

    test('Should throw error on empty decryption data', () => {
      expect(() => {
        decrypt('')
      }).toThrow()
    })

    test('Should handle Korean characters', () => {
      const korean = '한글 데이터 암호화 테스트'
      const encrypted = encrypt(korean)
      const decrypted = decrypt(encrypted)

      expect(decrypted).toBe(korean)
    })
  })
})

describe('SecureStorage - Class Methods', () => {
  let storage

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    storage = new SecureStorage('test_')
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('constructor and checkAvailability()', () => {
    test('Should create instance with default prefix', () => {
      const defaultStorage = new SecureStorage()
      expect(defaultStorage.prefix).toBe(STORAGE_PREFIX)
    })

    test('Should create instance with custom prefix', () => {
      expect(storage.prefix).toBe('test_')
    })

    test('Should detect localStorage availability', () => {
      expect(storage.isAvailable).toBe(true)
    })
  })

  describe('getFullKey()', () => {
    test('Should add prefix to key', () => {
      expect(storage.getFullKey('mykey')).toBe('test_mykey')
    })
  })

  describe('setItem() and getItem()', () => {
    test('Should store and retrieve string data', () => {
      const key = 'testKey'
      const value = 'testValue'

      const success = storage.setItem(key, value)
      expect(success).toBe(true)

      const retrieved = storage.getItem(key)
      expect(retrieved).toBe(value)
    })

    test('Should store and retrieve object data', () => {
      const key = 'userPrefs'
      const value = {
        theme: 'dark',
        language: 'ko',
        notifications: true
      }

      storage.setItem(key, value)
      const retrieved = storage.getItem(key)

      expect(retrieved).toEqual(value)
    })

    test('Should store and retrieve array data', () => {
      const key = 'items'
      const value = [1, 2, 3, 'test', { id: 4 }]

      storage.setItem(key, value)
      const retrieved = storage.getItem(key)

      expect(retrieved).toEqual(value)
    })

    test('Should return default value for non-existent key', () => {
      const retrieved = storage.getItem('nonexistent', 'default')
      expect(retrieved).toBe('default')
    })

    test('Should return null for non-existent key without default', () => {
      const retrieved = storage.getItem('nonexistent')
      expect(retrieved).toBe(null)
    })

    test('Should store data without encryption when encrypt=false', () => {
      const key = 'plainKey'
      const value = 'plainValue'

      storage.setItem(key, value, { encrypt: false })
      const retrieved = storage.getItem(key)

      expect(retrieved).toBe(value)
    })

    test('Should handle boolean values', () => {
      storage.setItem('flag1', true)
      storage.setItem('flag2', false)

      expect(storage.getItem('flag1')).toBe(true)
      expect(storage.getItem('flag2')).toBe(false)
    })

    test('Should handle null and undefined values', () => {
      storage.setItem('nullValue', null)
      storage.setItem('undefinedValue', undefined)

      expect(storage.getItem('nullValue')).toBe(null)
      expect(storage.getItem('undefinedValue')).toBe(undefined)
    })
  })

  describe('Expiry functionality', () => {
    test('Should store data with expiry and retrieve before expiry', () => {
      const key = 'expiringSoon'
      const value = 'temporary data'

      storage.setItem(key, value, { expiryMs: 1000 }) // 1 second
      const retrieved = storage.getItem(key)

      expect(retrieved).toBe(value)
    })

    test('Should return default value for expired data', (done) => {
      const key = 'expired'
      const value = 'will expire'

      storage.setItem(key, value, { expiryMs: 100 }) // 100ms

      setTimeout(() => {
        const retrieved = storage.getItem(key, 'default')
        expect(retrieved).toBe('default')
        expect(storage.hasItem(key)).toBe(false) // Should be removed
        done()
      }, 150)
    }, 10000)

    test('Should use DEFAULT_EXPIRY constants', () => {
      expect(DEFAULT_EXPIRY.NEVER).toBe(null)
      expect(DEFAULT_EXPIRY.ONE_HOUR).toBe(60 * 60 * 1000)
      expect(DEFAULT_EXPIRY.ONE_DAY).toBe(24 * 60 * 60 * 1000)
      expect(DEFAULT_EXPIRY.ONE_WEEK).toBe(7 * 24 * 60 * 60 * 1000)
      expect(DEFAULT_EXPIRY.ONE_MONTH).toBe(30 * 24 * 60 * 60 * 1000)
    })
  })

  describe('removeItem()', () => {
    test('Should remove existing item', () => {
      storage.setItem('toRemove', 'value')
      expect(storage.hasItem('toRemove')).toBe(true)

      const success = storage.removeItem('toRemove')
      expect(success).toBe(true)
      expect(storage.hasItem('toRemove')).toBe(false)
    })

    test('Should handle removing non-existent item', () => {
      const success = storage.removeItem('nonexistent')
      expect(success).toBe(true) // No error, returns true
    })
  })

  describe('clear()', () => {
    test('Should clear all items with prefix', () => {
      storage.setItem('key1', 'value1')
      storage.setItem('key2', 'value2')
      storage.setItem('key3', 'value3')

      expect(storage.length()).toBe(3)

      const success = storage.clear()
      expect(success).toBe(true)
      expect(storage.length()).toBe(0)
    })

    test('Should only clear items with matching prefix', () => {
      const storage1 = new SecureStorage('prefix1_')
      const storage2 = new SecureStorage('prefix2_')

      storage1.setItem('key1', 'value1')
      storage2.setItem('key2', 'value2')

      storage1.clear()

      expect(storage1.length()).toBe(0)
      expect(storage2.length()).toBe(1)

      storage2.clear()
    })
  })

  describe('keys()', () => {
    test('Should return empty array when no items', () => {
      expect(storage.keys()).toEqual([])
    })

    test('Should return all keys without prefix', () => {
      storage.setItem('key1', 'value1')
      storage.setItem('key2', 'value2')
      storage.setItem('key3', 'value3')

      const keys = storage.keys()
      expect(keys).toHaveLength(3)
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).toContain('key3')
    })

    test('Should only return keys with matching prefix', () => {
      storage.setItem('mykey', 'value')
      localStorage.setItem('other_key', 'value') // Different prefix

      const keys = storage.keys()
      expect(keys).toHaveLength(1)
      expect(keys).toContain('mykey')
    })
  })

  describe('hasItem()', () => {
    test('Should return true for existing item', () => {
      storage.setItem('exists', 'value')
      expect(storage.hasItem('exists')).toBe(true)
    })

    test('Should return false for non-existent item', () => {
      expect(storage.hasItem('nonexistent')).toBe(false)
    })
  })

  describe('length()', () => {
    test('Should return 0 for empty storage', () => {
      expect(storage.length()).toBe(0)
    })

    test('Should return correct count', () => {
      storage.setItem('key1', 'value1')
      expect(storage.length()).toBe(1)

      storage.setItem('key2', 'value2')
      expect(storage.length()).toBe(2)

      storage.removeItem('key1')
      expect(storage.length()).toBe(1)
    })
  })

  describe('cleanExpired()', () => {
    test('Should clean expired items', (done) => {
      storage.setItem('expired1', 'value1', { expiryMs: 100 })
      storage.setItem('expired2', 'value2', { expiryMs: 100 })
      storage.setItem('permanent', 'value3') // No expiry

      setTimeout(() => {
        const cleanedCount = storage.cleanExpired()
        expect(cleanedCount).toBe(2)
        expect(storage.length()).toBe(1)
        expect(storage.hasItem('permanent')).toBe(true)
        done()
      }, 150)
    }, 10000)

    test('Should return 0 when no expired items', () => {
      storage.setItem('key1', 'value1')
      storage.setItem('key2', 'value2')

      const cleanedCount = storage.cleanExpired()
      expect(cleanedCount).toBe(0)
      expect(storage.length()).toBe(2)
    })
  })
})

describe('SecureStorage - API Key Management', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('saveApiKey() and getApiKey()', () => {
    test('Should save and retrieve API key', () => {
      const provider = 'claude'
      const apiKey = 'sk-ant-api03-test123'

      const success = saveApiKey(provider, apiKey)
      expect(success).toBe(true)

      const retrieved = getApiKey(provider)
      expect(retrieved).toBe(apiKey)
    })

    test('Should handle multiple providers', () => {
      saveApiKey('claude', 'claude-key-123')
      saveApiKey('chatgpt', 'chatgpt-key-456')
      saveApiKey('perplexity', 'perplexity-key-789')

      expect(getApiKey('claude')).toBe('claude-key-123')
      expect(getApiKey('chatgpt')).toBe('chatgpt-key-456')
      expect(getApiKey('perplexity')).toBe('perplexity-key-789')
    })

    test('Should return null for non-existent API key', () => {
      expect(getApiKey('nonexistent')).toBe(null)
    })

    test('Should reject invalid API key', () => {
      expect(saveApiKey('claude', '')).toBe(false)
      expect(saveApiKey('claude', null)).toBe(false)
      expect(saveApiKey('claude', 123)).toBe(false)
    })

    test('Should update existing API key', () => {
      saveApiKey('claude', 'old-key')
      saveApiKey('claude', 'new-key')

      expect(getApiKey('claude')).toBe('new-key')
    })
  })

  describe('removeApiKey()', () => {
    test('Should remove API key', () => {
      saveApiKey('claude', 'test-key')
      expect(getApiKey('claude')).toBe('test-key')

      const success = removeApiKey('claude')
      expect(success).toBe(true)
      expect(getApiKey('claude')).toBe(null)
    })

    test('Should handle removing non-existent key', () => {
      const success = removeApiKey('nonexistent')
      expect(success).toBe(true)
    })
  })

  describe('removeAllApiKeys()', () => {
    test('Should remove all API keys', () => {
      saveApiKey('claude', 'claude-key')
      saveApiKey('chatgpt', 'chatgpt-key')
      saveApiKey('perplexity', 'perplexity-key')

      const success = removeAllApiKeys()
      expect(success).toBe(true)

      expect(getApiKey('claude')).toBe(null)
      expect(getApiKey('chatgpt')).toBe(null)
      expect(getApiKey('perplexity')).toBe(null)
    })

    test('Should succeed even with no API keys', () => {
      const success = removeAllApiKeys()
      expect(success).toBe(true)
    })
  })

  describe('maskApiKey()', () => {
    test('Should mask long API key with default visible chars', () => {
      const apiKey = 'sk-ant-api03-1234567890abcdef'
      const masked = maskApiKey(apiKey)

      expect(masked.endsWith('cdef')).toBe(true)
      expect(masked).toContain('•')
      expect(masked.length).toBeGreaterThanOrEqual(12)
    })

    test('Should mask API key with custom visible chars', () => {
      const apiKey = 'sk-ant-api03-1234567890abcdef'
      const masked = maskApiKey(apiKey, 6)

      expect(masked.endsWith('abcdef')).toBe(true)
    })

    test('Should handle short API key', () => {
      const apiKey = 'abc'
      const masked = maskApiKey(apiKey)

      expect(masked).toBe('••••••••')
    })

    test('Should handle empty API key', () => {
      const masked = maskApiKey('')
      expect(masked).toBe('••••••••')
    })

    test('Should handle null/undefined API key', () => {
      expect(maskApiKey(null)).toBe('••••••••')
      expect(maskApiKey(undefined)).toBe('••••••••')
    })

    test('Should create appropriate mask length', () => {
      const apiKey = 'sk-1234567890'
      const masked = maskApiKey(apiKey, 4)

      // Length should be at least 8 dots + 4 visible = 12
      expect(masked.length).toBeGreaterThanOrEqual(12)
      expect(masked.endsWith('7890')).toBe(true)
    })
  })
})

describe('SecureStorage - Singleton Instance', () => {
  afterEach(() => {
    localStorage.clear()
  })

  test('Should use default singleton instance', () => {
    expect(secureStorage).toBeInstanceOf(SecureStorage)
    expect(secureStorage.prefix).toBe(STORAGE_PREFIX)
  })

  test('Should persist data across singleton usage', () => {
    secureStorage.setItem('testKey', 'testValue')
    expect(secureStorage.getItem('testKey')).toBe('testValue')
  })

  test('Should work with API key functions using singleton', () => {
    saveApiKey('claude', 'test-key-123')

    // Verify data is in singleton storage
    const keys = secureStorage.keys()
    expect(keys).toContain('apiKey_claude')
  })
})

describe('SecureStorage - Edge Cases and Error Handling', () => {
  let storage

  beforeEach(() => {
    localStorage.clear()
    storage = new SecureStorage('test_')
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('Should handle very large data', () => {
    const largeData = 'x'.repeat(10000)
    const key = 'largeData'

    const success = storage.setItem(key, largeData)
    expect(success).toBe(true)

    const retrieved = storage.getItem(key)
    expect(retrieved).toBe(largeData)
  })

  test('Should handle special characters in keys', () => {
    const key = 'key-with-special.chars_123'
    const value = 'test'

    storage.setItem(key, value)
    expect(storage.getItem(key)).toBe(value)
  })

  test('Should handle complex nested objects', () => {
    const complex = {
      level1: {
        level2: {
          level3: {
            array: [1, 2, { nested: true }],
            date: new Date().toISOString(),
            nullValue: null,
            boolValue: false
          }
        }
      }
    }

    storage.setItem('complex', complex)
    const retrieved = storage.getItem('complex')

    expect(retrieved).toEqual(complex)
  })

  test('Should handle concurrent operations', () => {
    for (let i = 0; i < 10; i++) {
      storage.setItem(`key${i}`, `value${i}`)
    }

    expect(storage.length()).toBe(10)

    for (let i = 0; i < 10; i++) {
      expect(storage.getItem(`key${i}`)).toBe(`value${i}`)
    }
  })

  test('Should maintain data integrity after clear and re-add', () => {
    storage.setItem('key1', 'value1')
    storage.setItem('key2', 'value2')
    storage.clear()

    expect(storage.length()).toBe(0)

    storage.setItem('key3', 'value3')
    expect(storage.getItem('key3')).toBe('value3')
    expect(storage.length()).toBe(1)
  })
})

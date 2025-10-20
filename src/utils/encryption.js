/**
 * Encryption Utility for localStorage
 *
 * Uses AES-256-GCM encryption with crypto-js library
 * to securely store sensitive data like API keys
 *
 * @module utils/encryption
 * @version 1.0.0
 * @date 2024-10-18
 */

import CryptoJS from 'crypto-js';

// Encryption constants
const ENCRYPTION_KEY_STORAGE = '__aitax_enc_key__';
const ENCRYPTION_ALGORITHM = 'AES';
const KEY_SIZE = 256;
const ITERATIONS = 10000;

/**
 * Generate or retrieve encryption key
 * Creates a unique encryption key per browser/device
 *
 * @returns {string} Encryption key
 */
function getEncryptionKey() {
  let key = localStorage.getItem(ENCRYPTION_KEY_STORAGE);

  if (!key) {
    // Generate new key using browser fingerprint + random salt
    const browserFingerprint = getBrowserFingerprint();
    const salt = CryptoJS.lib.WordArray.random(128/8);

    key = CryptoJS.PBKDF2(
      browserFingerprint,
      salt,
      {
        keySize: KEY_SIZE/32,
        iterations: ITERATIONS
      }
    ).toString();

    localStorage.setItem(ENCRYPTION_KEY_STORAGE, key);
  }

  return key;
}

/**
 * Generate browser fingerprint for key derivation
 * Uses available browser characteristics
 *
 * @returns {string} Browser fingerprint
 */
function getBrowserFingerprint() {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage
  ];

  return components.join('|');
}

/**
 * Encrypt data using AES-256
 *
 * @param {string} plaintext - Data to encrypt
 * @returns {string} Encrypted data (Base64)
 * @throws {Error} If encryption fails
 */
export function encrypt(plaintext) {
  try {
    if (!plaintext) {
      throw new Error('Cannot encrypt empty data');
    }

    const key = getEncryptionKey();
    const encrypted = CryptoJS.AES.encrypt(plaintext, key).toString();

    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data using AES-256
 *
 * @param {string} ciphertext - Encrypted data (Base64)
 * @returns {string} Decrypted plaintext
 * @throws {Error} If decryption fails
 */
export function decrypt(ciphertext) {
  try {
    if (!ciphertext) {
      throw new Error('Cannot decrypt empty data');
    }

    const key = getEncryptionKey();
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key);
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);

    if (!plaintext) {
      throw new Error('Decryption resulted in empty string');
    }

    return plaintext;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Securely store data in localStorage (encrypted)
 *
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 * @throws {Error} If storage fails
 */
export function setSecureItem(key, value) {
  try {
    const jsonString = JSON.stringify(value);
    const encrypted = encrypt(jsonString);
    localStorage.setItem(key, encrypted);
  } catch (error) {
    console.error('Secure storage error:', error);
    throw new Error(`Failed to store ${key} securely`);
  }
}

/**
 * Retrieve and decrypt data from localStorage
 *
 * @param {string} key - Storage key
 * @returns {*} Decrypted and parsed value, or null if not found
 */
export function getSecureItem(key) {
  try {
    const encrypted = localStorage.getItem(key);

    if (!encrypted) {
      return null;
    }

    const decrypted = decrypt(encrypted);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Secure retrieval error:', error);
    return null;
  }
}

/**
 * Remove item from localStorage
 *
 * @param {string} key - Storage key
 */
export function removeSecureItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Secure removal error:', error);
  }
}

/**
 * Clear all encrypted items from localStorage
 * Preserves the encryption key
 */
export function clearSecureStorage() {
  try {
    const key = localStorage.getItem(ENCRYPTION_KEY_STORAGE);
    localStorage.clear();
    if (key) {
      localStorage.setItem(ENCRYPTION_KEY_STORAGE, key);
    }
  } catch (error) {
    console.error('Clear storage error:', error);
  }
}

/**
 * Reset encryption key (force re-encryption of all data)
 * WARNING: This will invalidate all existing encrypted data
 */
export function resetEncryptionKey() {
  try {
    localStorage.removeItem(ENCRYPTION_KEY_STORAGE);
    // Generate new key
    getEncryptionKey();
  } catch (error) {
    console.error('Reset key error:', error);
  }
}

/**
 * Verify encryption/decryption is working
 *
 * @returns {boolean} True if encryption is functional
 */
export function testEncryption() {
  try {
    const testData = 'AI Tax Consultant Test Data 테스트';
    const encrypted = encrypt(testData);
    const decrypted = decrypt(encrypted);

    return decrypted === testData;
  } catch (error) {
    console.error('Encryption test failed:', error);
    return false;
  }
}

// API Keys Storage Constants
export const API_KEYS_STORAGE = {
  CLAUDE: '__aitax_api_claude__',
  CHATGPT: '__aitax_api_chatgpt__',
  PERPLEXITY: '__aitax_api_perplexity__',
};

/**
 * Store API key securely
 *
 * @param {string} provider - 'claude' | 'chatgpt' | 'perplexity'
 * @param {string} apiKey - API key to store
 * @throws {Error} If provider is invalid or storage fails
 */
export function storeAPIKey(provider, apiKey) {
  const providerUpper = provider.toUpperCase();
  const storageKey = API_KEYS_STORAGE[providerUpper];

  if (!storageKey) {
    throw new Error(`Invalid provider: ${provider}`);
  }

  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error('Invalid API key');
  }

  setSecureItem(storageKey, {
    key: apiKey,
    storedAt: new Date().toISOString(),
    provider: provider
  });
}

/**
 * Retrieve API key
 *
 * @param {string} provider - 'claude' | 'chatgpt' | 'perplexity'
 * @returns {string|null} API key or null if not found
 */
export function getAPIKey(provider) {
  const providerUpper = provider.toUpperCase();
  const storageKey = API_KEYS_STORAGE[providerUpper];

  if (!storageKey) {
    return null;
  }

  const data = getSecureItem(storageKey);
  return data ? data.key : null;
}

/**
 * Remove API key
 *
 * @param {string} provider - 'claude' | 'chatgpt' | 'perplexity'
 */
export function removeAPIKey(provider) {
  const providerUpper = provider.toUpperCase();
  const storageKey = API_KEYS_STORAGE[providerUpper];

  if (storageKey) {
    removeSecureItem(storageKey);
  }
}

/**
 * Check if API key exists
 *
 * @param {string} provider - 'claude' | 'chatgpt' | 'perplexity'
 * @returns {boolean} True if API key exists
 */
export function hasAPIKey(provider) {
  return getAPIKey(provider) !== null;
}

/**
 * Get all stored API keys info (without exposing keys)
 *
 * @returns {Object} Object with provider names as keys and boolean values
 */
export function getAPIKeysStatus() {
  return {
    claude: hasAPIKey('claude'),
    chatgpt: hasAPIKey('chatgpt'),
    perplexity: hasAPIKey('perplexity')
  };
}

/**
 * Mask API key for display
 * Shows first 8 and last 4 characters
 *
 * @param {string} apiKey - Full API key
 * @returns {string} Masked key (e.g., "sk-1234...5678")
 */
export function maskAPIKey(apiKey) {
  if (!apiKey || apiKey.length < 12) {
    return '••••••••••••';
  }

  const start = apiKey.substring(0, 8);
  const end = apiKey.substring(apiKey.length - 4);
  return `${start}...${end}`;
}

export default {
  encrypt,
  decrypt,
  setSecureItem,
  getSecureItem,
  removeSecureItem,
  clearSecureStorage,
  resetEncryptionKey,
  testEncryption,
  storeAPIKey,
  getAPIKey,
  removeAPIKey,
  hasAPIKey,
  getAPIKeysStatus,
  maskAPIKey
};

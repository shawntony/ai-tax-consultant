/**
 * 보안 저장소 유틸리티 (Secure Storage Utility)
 *
 * localStorage를 사용한 민감 데이터 암호화 저장
 * - AES-256 암호화 (CryptoJS 사용)
 * - API 키 및 사용자 설정 안전 저장
 * - 자동 만료 기능 지원
 *
 * @version 1.0.0
 * @date 2025-10-18
 * @task M2.4.2 - localStorage 암호화 구현
 */

import CryptoJS from 'crypto-js'

// ==========================================
// 설정 및 상수
// ==========================================

/**
 * 암호화 설정
 */
const ENCRYPTION_CONFIG = {
  algorithm: 'AES',
  keySize: 256,
  iterations: 1000,
  saltPrefix: 'aitax_',
  ivLength: 16
}

/**
 * 저장소 키 접두사
 */
const STORAGE_PREFIX = 'aitaxconsultant_'

/**
 * 기본 만료 시간 (밀리초)
 */
const DEFAULT_EXPIRY = {
  NEVER: null,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
  ONE_MONTH: 30 * 24 * 60 * 60 * 1000
}

/**
 * 마스터 키 생성 (브라우저 고유 정보 기반)
 * 주의: 프로덕션에서는 더 강력한 키 관리 시스템 필요
 */
function generateMasterKey() {
  const browserInfo = navigator.userAgent + navigator.language
  const timestamp = new Date().toISOString().split('T')[0] // 날짜만 사용 (안정성)
  const seed = `${ENCRYPTION_CONFIG.saltPrefix}${browserInfo}${timestamp}`
  return CryptoJS.SHA256(seed).toString()
}

// ==========================================
// 암호화/복호화 함수
// ==========================================

/**
 * 데이터 암호화
 * @param {string} data - 암호화할 데이터
 * @param {string} [customKey] - 커스텀 암호화 키 (선택)
 * @returns {string} 암호화된 데이터
 */
function encrypt(data, customKey = null) {
  try {
    const key = customKey || generateMasterKey()
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      keySize: ENCRYPTION_CONFIG.keySize / 32,
      iterations: ENCRYPTION_CONFIG.iterations
    })
    return encrypted.toString()
  } catch (error) {
    console.error('[SecureStorage] Encryption failed:', error)
    throw new Error('데이터 암호화에 실패했습니다')
  }
}

/**
 * 데이터 복호화
 * @param {string} encryptedData - 암호화된 데이터
 * @param {string} [customKey] - 커스텀 암호화 키 (선택)
 * @returns {string} 복호화된 데이터
 */
function decrypt(encryptedData, customKey = null) {
  try {
    const key = customKey || generateMasterKey()
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      keySize: ENCRYPTION_CONFIG.keySize / 32,
      iterations: ENCRYPTION_CONFIG.iterations
    })
    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8)

    if (!decryptedStr) {
      throw new Error('복호화 결과가 비어있습니다')
    }

    return decryptedStr
  } catch (error) {
    console.error('[SecureStorage] Decryption failed:', error)
    throw new Error('데이터 복호화에 실패했습니다')
  }
}

// ==========================================
// 보안 저장소 클래스
// ==========================================

/**
 * SecureStorage 클래스
 * localStorage를 암호화하여 안전하게 사용
 */
class SecureStorage {
  /**
   * 생성자
   * @param {string} [customPrefix] - 커스텀 키 접두사
   */
  constructor(customPrefix = STORAGE_PREFIX) {
    this.prefix = customPrefix
    this.isAvailable = this.checkAvailability()
  }

  /**
   * localStorage 사용 가능 여부 확인
   * @returns {boolean}
   */
  checkAvailability() {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (error) {
      console.warn('[SecureStorage] localStorage is not available:', error)
      return false
    }
  }

  /**
   * 전체 키 생성 (접두사 포함)
   * @param {string} key - 원본 키
   * @returns {string}
   */
  getFullKey(key) {
    return `${this.prefix}${key}`
  }

  /**
   * 데이터 저장
   * @param {string} key - 저장 키
   * @param {any} value - 저장할 값 (객체 자동 직렬화)
   * @param {Object} [options] - 옵션
   * @param {number|null} [options.expiryMs] - 만료 시간 (밀리초, null = 만료 없음)
   * @param {boolean} [options.encrypt] - 암호화 여부 (기본: true)
   * @returns {boolean} 성공 여부
   */
  setItem(key, value, options = {}) {
    if (!this.isAvailable) {
      console.error('[SecureStorage] localStorage is not available')
      return false
    }

    const {
      expiryMs = null,
      encrypt: shouldEncrypt = true
    } = options

    try {
      // 데이터 래핑 (값 + 메타데이터)
      const wrapper = {
        value,
        timestamp: Date.now(),
        expiry: expiryMs ? Date.now() + expiryMs : null,
        encrypted: shouldEncrypt
      }

      // JSON 직렬화
      let dataStr = JSON.stringify(wrapper)

      // 암호화
      if (shouldEncrypt) {
        dataStr = encrypt(dataStr)
      }

      // 저장
      const fullKey = this.getFullKey(key)
      localStorage.setItem(fullKey, dataStr)

      return true
    } catch (error) {
      console.error(`[SecureStorage] Failed to set item "${key}":`, error)
      return false
    }
  }

  /**
   * 데이터 조회
   * @param {string} key - 조회 키
   * @param {any} [defaultValue] - 기본값 (데이터 없을 때)
   * @returns {any|null} 저장된 값 또는 기본값
   */
  getItem(key, defaultValue = null) {
    if (!this.isAvailable) {
      console.error('[SecureStorage] localStorage is not available')
      return defaultValue
    }

    try {
      const fullKey = this.getFullKey(key)
      let dataStr = localStorage.getItem(fullKey)

      if (!dataStr) {
        return defaultValue
      }

      // 복호화 시도 (암호화된 데이터인 경우)
      try {
        const decrypted = decrypt(dataStr)
        dataStr = decrypted
      } catch (decryptError) {
        // 암호화되지 않은 데이터일 수 있음 (encrypt: false로 저장된 경우)
        // 그대로 진행
      }

      // JSON 파싱
      const wrapper = JSON.parse(dataStr)

      // 만료 확인
      if (wrapper.expiry && Date.now() > wrapper.expiry) {
        console.info(`[SecureStorage] Item "${key}" has expired`)
        this.removeItem(key)
        return defaultValue
      }

      return wrapper.value
    } catch (error) {
      console.error(`[SecureStorage] Failed to get item "${key}":`, error)
      return defaultValue
    }
  }

  /**
   * 데이터 삭제
   * @param {string} key - 삭제 키
   * @returns {boolean} 성공 여부
   */
  removeItem(key) {
    if (!this.isAvailable) {
      return false
    }

    try {
      const fullKey = this.getFullKey(key)
      localStorage.removeItem(fullKey)
      return true
    } catch (error) {
      console.error(`[SecureStorage] Failed to remove item "${key}":`, error)
      return false
    }
  }

  /**
   * 모든 데이터 삭제
   * @returns {boolean} 성공 여부
   */
  clear() {
    if (!this.isAvailable) {
      return false
    }

    try {
      // 접두사와 일치하는 키만 삭제
      const keys = Object.keys(localStorage)
      const prefixKeys = keys.filter(k => k.startsWith(this.prefix))

      prefixKeys.forEach(key => {
        localStorage.removeItem(key)
      })

      return true
    } catch (error) {
      console.error('[SecureStorage] Failed to clear storage:', error)
      return false
    }
  }

  /**
   * 저장된 키 목록 조회
   * @returns {string[]} 키 목록 (접두사 제외)
   */
  keys() {
    if (!this.isAvailable) {
      return []
    }

    try {
      const allKeys = Object.keys(localStorage)
      return allKeys
        .filter(k => k.startsWith(this.prefix))
        .map(k => k.substring(this.prefix.length))
    } catch (error) {
      console.error('[SecureStorage] Failed to get keys:', error)
      return []
    }
  }

  /**
   * 데이터 존재 여부 확인
   * @param {string} key - 확인할 키
   * @returns {boolean}
   */
  hasItem(key) {
    if (!this.isAvailable) {
      return false
    }

    const fullKey = this.getFullKey(key)
    return localStorage.getItem(fullKey) !== null
  }

  /**
   * 저장된 항목 수 조회
   * @returns {number}
   */
  length() {
    return this.keys().length
  }

  /**
   * 만료된 항목 정리
   * @returns {number} 정리된 항목 수
   */
  cleanExpired() {
    if (!this.isAvailable) {
      return 0
    }

    let cleanedCount = 0

    try {
      const keys = this.keys()

      keys.forEach(key => {
        const value = this.getItem(key) // getItem에서 자동으로 만료 체크 및 삭제
        if (value === null) {
          cleanedCount++
        }
      })

      return cleanedCount
    } catch (error) {
      console.error('[SecureStorage] Failed to clean expired items:', error)
      return 0
    }
  }
}

// ==========================================
// 싱글톤 인스턴스
// ==========================================

/**
 * 기본 SecureStorage 인스턴스
 */
const secureStorage = new SecureStorage()

// ==========================================
// 편의 함수 (API 키 관리 전용)
// ==========================================

/**
 * API 키 저장
 * @param {string} provider - AI 제공자 ('claude' | 'chatgpt' | 'perplexity')
 * @param {string} apiKey - API 키
 * @returns {boolean} 성공 여부
 */
function saveApiKey(provider, apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    console.error('[SecureStorage] Invalid API key')
    return false
  }

  const key = `apiKey_${provider}`
  return secureStorage.setItem(key, apiKey, {
    expiryMs: DEFAULT_EXPIRY.NEVER,
    encrypt: true
  })
}

/**
 * API 키 조회
 * @param {string} provider - AI 제공자
 * @returns {string|null} API 키 또는 null
 */
function getApiKey(provider) {
  const key = `apiKey_${provider}`
  return secureStorage.getItem(key, null)
}

/**
 * API 키 삭제
 * @param {string} provider - AI 제공자
 * @returns {boolean} 성공 여부
 */
function removeApiKey(provider) {
  const key = `apiKey_${provider}`
  return secureStorage.removeItem(key)
}

/**
 * 모든 API 키 삭제
 * @returns {boolean} 성공 여부
 */
function removeAllApiKeys() {
  const providers = ['claude', 'chatgpt', 'perplexity']
  let allSuccess = true

  providers.forEach(provider => {
    const success = removeApiKey(provider)
    if (!success) allSuccess = false
  })

  return allSuccess
}

/**
 * API 키 마스킹
 * @param {string} apiKey - 원본 API 키
 * @param {number} [visibleChars=4] - 보이는 문자 수
 * @returns {string} 마스킹된 API 키 (예: "sk-••••••••1234")
 */
function maskApiKey(apiKey, visibleChars = 4) {
  if (!apiKey || apiKey.length <= visibleChars) {
    return '••••••••'
  }

  const masked = '•'.repeat(Math.max(apiKey.length - visibleChars, 8))
  const visible = apiKey.slice(-visibleChars)
  return `${masked}${visible}`
}

// ==========================================
// Export
// ==========================================

export {
  // 클래스
  SecureStorage,

  // 싱글톤 인스턴스
  secureStorage,

  // 암호화 함수
  encrypt,
  decrypt,

  // API 키 관리 함수
  saveApiKey,
  getApiKey,
  removeApiKey,
  removeAllApiKeys,
  maskApiKey,

  // 상수
  DEFAULT_EXPIRY,
  STORAGE_PREFIX
}

export default secureStorage

// CommonJS export (Node.js 호환)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
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
  }
}

/**
 * 사용 예시
 *
 * // 1. API 키 저장
 * import { saveApiKey, getApiKey, maskApiKey } from './secureStorage.js'
 *
 * saveApiKey('claude', 'sk-ant-api03-....')
 *
 * // 2. API 키 조회
 * const claudeKey = getApiKey('claude')
 *
 * // 3. API 키 마스킹 (UI 표시용)
 * const maskedKey = maskApiKey(claudeKey)
 * console.log(maskedKey) // "••••••••1234"
 *
 * // 4. 일반 데이터 저장 (만료 시간 설정)
 * import { secureStorage, DEFAULT_EXPIRY } from './secureStorage.js'
 *
 * secureStorage.setItem('userPreferences', {
 *   theme: 'dark',
 *   language: 'ko'
 * }, {
 *   expiryMs: DEFAULT_EXPIRY.ONE_WEEK
 * })
 *
 * // 5. 데이터 조회
 * const prefs = secureStorage.getItem('userPreferences', {})
 *
 * // 6. 만료된 항목 정리
 * const cleanedCount = secureStorage.cleanExpired()
 * console.log(`${cleanedCount}개 항목 정리됨`)
 */

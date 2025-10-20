/**
 * API Key Management Integration Tests
 *
 * Tests the complete integration between:
 * - APIKeyForm component (UI layer)
 * - encryption.js utilities (storage layer)
 * - apiKeyValidator.js (validation layer)
 * - localStorage (browser storage)
 *
 * Integration flow:
 * User Input → APIKeyForm → encryption → localStorage → encryption → Display
 * User Input → APIKeyForm → apiKeyValidator → Network API → Result → Display
 *
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import APIKeyForm from '../APIKeyForm.jsx'
import * as encryption from '../../utils/encryption'
import * as apiKeyValidator from '../../utils/apiKeyValidator'

// Mock only the network validation calls, not the encryption layer
jest.mock('../../utils/apiKeyValidator')

// Mock global fetch for validation API calls
global.fetch = jest.fn()

describe('API Key Management Integration Tests', () => {
  let localStorageMock

  beforeEach(() => {
    // Create a mock localStorage that actually stores data
    localStorageMock = {}

    Storage.prototype.getItem = jest.fn((key) => localStorageMock[key] || null)
    Storage.prototype.setItem = jest.fn((key, value) => {
      localStorageMock[key] = value
    })
    Storage.prototype.removeItem = jest.fn((key) => {
      delete localStorageMock[key]
    })
    Storage.prototype.clear = jest.fn(() => {
      localStorageMock = {}
    })

    // Clear all mocks
    jest.clearAllMocks()

    // Mock window.confirm
    global.confirm = jest.fn(() => true)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Integration: Form → Encryption → Storage', () => {
    test('Should complete full save workflow with real encryption', async () => {
      const user = userEvent.setup()
      render(<APIKeyForm />)

      // Step 1: User enters API key
      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      const testKey = 'sk-ant-test123456789'
      await user.type(claudeInput, testKey)

      // Step 2: User clicks save
      const saveButtons = screen.getAllByText('저장')
      await user.click(saveButtons[0])

      // Step 3: Verify data flow through encryption layer
      await waitFor(() => {
        // Check that localStorage.setItem was called
        expect(localStorage.setItem).toHaveBeenCalled()

        // Check that success message appears
        expect(screen.getByText(/API 키가 안전하게 저장되었습니다/)).toBeInTheDocument()
      })

      // Step 4: Verify the stored data is actually encrypted
      const storedData = localStorageMock['__aitax_api_claude__']
      expect(storedData).toBeDefined()
      expect(storedData).not.toContain(testKey) // Should be encrypted, not plaintext

      // Step 5: Component transitions to "saved key display" mode
      // The input field is replaced with masked key display, so input no longer exists
      // Verify the saved key display is shown instead
      await waitFor(() => {
        const maskedKey = encryption.maskAPIKey(testKey)
        expect(screen.getByText(maskedKey)).toBeInTheDocument()
        expect(screen.getByText('✅ 저장됨')).toBeInTheDocument()
      })
    })

    test('Should retrieve and decrypt saved keys on component mount', async () => {
      // Pre-populate localStorage with encrypted key using real encryption
      const testKey = 'sk-ant-stored-key-12345'
      encryption.storeAPIKey('claude', testKey)

      // Mount component
      render(<APIKeyForm />)

      // Verify that the key was retrieved and decrypted
      await waitFor(() => {
        // Should show masked version of the key
        const maskedKey = encryption.maskAPIKey(testKey)
        expect(screen.getByText(maskedKey)).toBeInTheDocument()
        expect(screen.getByText('✅ 저장됨')).toBeInTheDocument()
      })

      // Verify the actual encryption/decryption worked
      const retrievedKey = encryption.getAPIKey('claude')
      expect(retrievedKey).toBe(testKey)
    })

    test('Should handle multiple providers independently with real storage', async () => {
      const user = userEvent.setup()
      render(<APIKeyForm />)

      // Save keys for all three providers
      const keys = {
        claude: 'sk-ant-claude-key-123',
        chatgpt: 'sk-chatgpt-key-456',
        perplexity: 'pplx-perplexity-key-789'
      }

      // Save Claude key
      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      await user.type(claudeInput, keys.claude)
      const saveButtons = screen.getAllByText('저장')
      await user.click(saveButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/claude API 키가 안전하게 저장되었습니다/)).toBeInTheDocument()
      })

      // Save ChatGPT key
      const chatgptInput = screen.getByPlaceholderText('sk-...')
      await user.type(chatgptInput, keys.chatgpt)
      await user.click(saveButtons[1])

      await waitFor(() => {
        expect(screen.getByText(/chatgpt API 키가 안전하게 저장되었습니다/)).toBeInTheDocument()
      })

      // Save Perplexity key
      const perplexityInput = screen.getByPlaceholderText('pplx-...')
      await user.type(perplexityInput, keys.perplexity)
      await user.click(saveButtons[2])

      await waitFor(() => {
        expect(screen.getByText(/perplexity API 키가 안전하게 저장되었습니다/)).toBeInTheDocument()
      })

      // Verify all keys are independently stored
      const storedClaude = encryption.getAPIKey('claude')
      const storedChatGPT = encryption.getAPIKey('chatgpt')
      const storedPerplexity = encryption.getAPIKey('perplexity')

      expect(storedClaude).toBe(keys.claude)
      expect(storedChatGPT).toBe(keys.chatgpt)
      expect(storedPerplexity).toBe(keys.perplexity)
    })

    test('Should handle encryption errors gracefully', async () => {
      const user = userEvent.setup()

      // Mock storeAPIKey to fail (not encrypt directly)
      jest.spyOn(encryption, 'storeAPIKey').mockImplementation(() => {
        throw new Error('Encryption service unavailable')
      })

      render(<APIKeyForm />)

      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      await user.type(claudeInput, 'sk-ant-test-key')

      const saveButtons = screen.getAllByText('저장')
      await user.click(saveButtons[0])

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/저장 실패:/)).toBeInTheDocument()
      }, { timeout: 10000 })

      // Restore mock
      encryption.storeAPIKey.mockRestore()
    })
  })

  describe('Integration: Form → Validation → Network', () => {
    test('Should complete full validation workflow with Claude API', async () => {
      const user = userEvent.setup()

      // Mock successful validation
      apiKeyValidator.validateAPIKey.mockResolvedValue({
        valid: true,
        message: 'Claude API 키가 유효합니다'
      })

      render(<APIKeyForm />)

      // Step 1: Enter API key
      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      const testKey = 'sk-ant-valid-key-12345'
      await user.type(claudeInput, testKey)

      // Step 2: Click validate
      const validateButtons = screen.getAllByText('키 검증')
      await user.click(validateButtons[0])

      // Step 3: Verify validation was called with correct parameters
      await waitFor(() => {
        expect(apiKeyValidator.validateAPIKey).toHaveBeenCalledWith('claude', testKey)
      })

      // Step 4: Verify success message appears
      await waitFor(() => {
        expect(screen.getByText(/Claude API 키가 유효합니다/)).toBeInTheDocument()
      }, { timeout: 10000 })

      await waitFor(() => {
        expect(screen.getAllByText(/✅/).length).toBeGreaterThan(0)
      }, { timeout: 10000 })
    }, 15000)

    test('Should handle invalid API key validation', async () => {
      const user = userEvent.setup()

      // Mock failed validation
      apiKeyValidator.validateAPIKey.mockResolvedValue({
        valid: false,
        message: 'API 키가 유효하지 않습니다 (401 Unauthorized)'
      })

      render(<APIKeyForm />)

      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      await user.type(claudeInput, 'sk-ant-invalid-key')

      const validateButtons = screen.getAllByText('키 검증')
      await user.click(validateButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/API 키가 유효하지 않습니다/)).toBeInTheDocument()
      }, { timeout: 10000 })

      await waitFor(() => {
        expect(screen.getAllByText(/❌/).length).toBeGreaterThan(0)
      }, { timeout: 10000 })
    }, 15000)

    test('Should handle network errors during validation', async () => {
      const user = userEvent.setup()

      // Mock network error
      apiKeyValidator.validateAPIKey.mockRejectedValue(
        new Error('Network request failed')
      )

      render(<APIKeyForm />)

      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      await user.type(claudeInput, 'sk-ant-test-key')

      const validateButtons = screen.getAllByText('키 검증')
      await user.click(validateButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/검증 실패:/)).toBeInTheDocument()
      }, { timeout: 10000 })
    })

    test('Should show loading state during validation', async () => {
      const user = userEvent.setup()

      // Mock slow validation
      apiKeyValidator.validateAPIKey.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ valid: true, message: 'Valid' }), 100))
      )

      render(<APIKeyForm />)

      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      await user.type(claudeInput, 'sk-ant-test-key')

      const validateButtons = screen.getAllByText('키 검증')
      await user.click(validateButtons[0])

      // Should show loading state
      const validatingButton = await screen.findByText('검증 중...', {}, { timeout: 10000 })
      expect(validatingButton).toBeInTheDocument()
      expect(validatingButton).toBeDisabled()

      // Should complete and show result - use more specific selector
      await waitFor(() => {
        const validationResults = screen.getAllByText(/Valid/)
        expect(validationResults.length).toBeGreaterThan(0)
      }, { timeout: 10000 })
    }, 30000)

    test('Should validate all three providers independently', async () => {
      const user = userEvent.setup()

      // Mock different validation results for each provider
      apiKeyValidator.validateAPIKey.mockImplementation((provider, key) => {
        if (provider === 'claude') {
          return Promise.resolve({ valid: true, message: 'Claude API 키가 유효합니다' })
        }
        if (provider === 'chatgpt') {
          return Promise.resolve({ valid: false, message: 'ChatGPT API 키가 유효하지 않습니다' })
        }
        if (provider === 'perplexity') {
          return Promise.resolve({ valid: true, message: 'Perplexity API 키가 유효합니다' })
        }
      })

      render(<APIKeyForm />)

      // Validate Claude (success)
      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      await user.type(claudeInput, 'sk-ant-key-123')
      const validateButtons = screen.getAllByText('키 검증')
      await user.click(validateButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/Claude API 키가 유효합니다/)).toBeInTheDocument()
      }, { timeout: 10000 })

      // Validate ChatGPT (failure)
      const chatgptInput = screen.getByPlaceholderText('sk-...')
      await user.type(chatgptInput, 'sk-invalid-key')
      await user.click(validateButtons[1])

      await waitFor(() => {
        expect(screen.getByText(/ChatGPT API 키가 유효하지 않습니다/)).toBeInTheDocument()
      }, { timeout: 10000 })

      // Validate Perplexity (success)
      const perplexityInput = screen.getByPlaceholderText('pplx-...')
      await user.type(perplexityInput, 'pplx-key-789')
      await user.click(validateButtons[2])

      await waitFor(() => {
        expect(screen.getByText(/Perplexity API 키가 유효합니다/)).toBeInTheDocument()
      }, { timeout: 10000 })
    }, 20000)
  })

  describe('Integration: Delete Flow', () => {
    test('Should complete full delete workflow with storage cleanup', async () => {
      const user = userEvent.setup()

      // Pre-populate with a saved key
      const testKey = 'sk-ant-saved-key-12345'
      encryption.storeAPIKey('claude', testKey)

      render(<APIKeyForm />)

      // Verify key is displayed
      await waitFor(() => {
        const maskedKey = encryption.maskAPIKey(testKey)
        expect(screen.getByText(maskedKey)).toBeInTheDocument()
      })

      // Delete the key
      const deleteButtons = screen.getAllByText('삭제')
      await user.click(deleteButtons[0])

      // Verify confirmation was called
      expect(global.confirm).toHaveBeenCalledWith(
        expect.stringContaining('삭제하시겠습니까')
      )

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText(/API 키가 삭제되었습니다/)).toBeInTheDocument()
      })

      // Verify key was actually removed from storage
      const retrievedKey = encryption.getAPIKey('claude')
      expect(retrievedKey).toBeNull()

      // Verify localStorage was updated
      expect(localStorage.removeItem).toHaveBeenCalled()
    })

    test('Should not delete if user cancels confirmation', async () => {
      const user = userEvent.setup()

      // Pre-populate with a saved key
      const testKey = 'sk-ant-saved-key-12345'
      encryption.storeAPIKey('claude', testKey)

      // Mock user canceling
      global.confirm.mockReturnValue(false)

      render(<APIKeyForm />)

      const deleteButtons = screen.getAllByText('삭제')
      await user.click(deleteButtons[0])

      // Verify key still exists
      const retrievedKey = encryption.getAPIKey('claude')
      expect(retrievedKey).toBe(testKey)
    })

    test('Should handle delete errors gracefully', async () => {
      const user = userEvent.setup()

      // Pre-populate with a saved key
      encryption.storeAPIKey('claude', 'sk-ant-test-key')

      // Mock removeAPIKey to throw error
      jest.spyOn(encryption, 'removeAPIKey').mockImplementation(() => {
        throw new Error('Storage removal failed')
      })

      render(<APIKeyForm />)

      const deleteButtons = screen.getAllByText('삭제')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/삭제 실패:/)).toBeInTheDocument()
      })

      // Restore mock
      encryption.removeAPIKey.mockRestore()
    })
  })

  describe('Integration: Complete User Journeys', () => {
    test('Journey: Save → Validate → Delete workflow', async () => {
      const user = userEvent.setup()

      // Mock successful validation
      apiKeyValidator.validateAPIKey.mockResolvedValue({
        valid: true,
        message: 'Claude API 키가 유효합니다'
      })

      render(<APIKeyForm />)

      const testKey = 'sk-ant-journey-test-12345'

      // Step 1: Save key
      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      await user.type(claudeInput, testKey)

      const saveButtons = screen.getAllByText('저장')
      await user.click(saveButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/API 키가 안전하게 저장되었습니다/)).toBeInTheDocument()
      })

      // Verify key is stored and encrypted
      const storedKey = encryption.getAPIKey('claude')
      expect(storedKey).toBe(testKey)

      // Step 2: Re-mount to simulate page refresh
      const { unmount } = render(<APIKeyForm />)

      // Verify key is still there after refresh
      await waitFor(() => {
        const maskedKey = encryption.maskAPIKey(testKey)
        expect(screen.getAllByText(maskedKey)[0]).toBeInTheDocument()
      })

      unmount()

      // Step 3: Delete key
      render(<APIKeyForm />)

      const deleteButtons = screen.getAllByText('삭제')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/API 키가 삭제되었습니다/)).toBeInTheDocument()
      })

      // Verify key is gone
      const deletedKey = encryption.getAPIKey('claude')
      expect(deletedKey).toBeNull()
    })

    test('Journey: Validate before save → Save only if valid', async () => {
      const user = userEvent.setup()

      // First validation fails
      apiKeyValidator.validateAPIKey.mockResolvedValueOnce({
        valid: false,
        message: 'API 키가 유효하지 않습니다'
      })

      render(<APIKeyForm />)

      const testKey = 'sk-ant-test-key-12345'
      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      await user.type(claudeInput, testKey)

      // Try to validate
      const validateButtons = screen.getAllByText('키 검증')
      await user.click(validateButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/API 키가 유효하지 않습니다/)).toBeInTheDocument()
      }, { timeout: 10000 })

      // User corrects the key
      await user.clear(claudeInput)
      const validKey = 'sk-ant-valid-key-67890'
      await user.type(claudeInput, validKey)

      // Validation now succeeds
      apiKeyValidator.validateAPIKey.mockResolvedValueOnce({
        valid: true,
        message: 'Claude API 키가 유효합니다'
      })

      await user.click(validateButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/Claude API 키가 유효합니다/)).toBeInTheDocument()
      }, { timeout: 10000 })

      // Now save
      const saveButtons = screen.getAllByText('저장')
      await user.click(saveButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/API 키가 안전하게 저장되었습니다/)).toBeInTheDocument()
      }, { timeout: 10000 })

      // Verify correct key was saved
      const storedKey = encryption.getAPIKey('claude')
      expect(storedKey).toBe(validKey)
    }, 20000)

    test('Journey: Update existing key', async () => {
      const user = userEvent.setup()

      // Pre-populate with old key
      const oldKey = 'sk-ant-old-key-12345'
      encryption.storeAPIKey('claude', oldKey)

      render(<APIKeyForm />)

      // Verify old key is displayed
      await waitFor(() => {
        const maskedOldKey = encryption.maskAPIKey(oldKey)
        expect(screen.getByText(maskedOldKey)).toBeInTheDocument()
      })

      // Delete old key
      const deleteButtons = screen.getAllByText('삭제')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/API 키가 삭제되었습니다/)).toBeInTheDocument()
      })

      // Save new key
      const newKey = 'sk-ant-new-key-67890'
      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      await user.type(claudeInput, newKey)

      const saveButtons = screen.getAllByText('저장')
      await user.click(saveButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/API 키가 안전하게 저장되었습니다/)).toBeInTheDocument()
      })

      // Verify new key replaced old key
      const storedKey = encryption.getAPIKey('claude')
      expect(storedKey).toBe(newKey)
      expect(storedKey).not.toBe(oldKey)
    })
  })

  describe('Integration: Error Recovery', () => {
    test('Should recover from corrupted localStorage data', async () => {
      // Manually corrupt the localStorage data
      localStorageMock['__aitax_api_claude__'] = 'corrupted-non-encrypted-data'

      render(<APIKeyForm />)

      // Should not crash, should handle gracefully
      await waitFor(() => {
        expect(screen.getByText('API 키 관리')).toBeInTheDocument()
      })

      // Should allow saving new key despite corrupted data
      const user = userEvent.setup()
      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      await user.type(claudeInput, 'sk-ant-recovery-key')

      const saveButtons = screen.getAllByText('저장')
      await user.click(saveButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/API 키가 안전하게 저장되었습니다/)).toBeInTheDocument()
      })
    })

    test('Should handle localStorage quota exceeded', async () => {
      const user = userEvent.setup()

      // Mock localStorage.setItem to throw quota exceeded error
      Storage.prototype.setItem = jest.fn(() => {
        throw new DOMException('QuotaExceededError')
      })

      render(<APIKeyForm />)

      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      await user.type(claudeInput, 'sk-ant-test-key')

      const saveButtons = screen.getAllByText('저장')
      await user.click(saveButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/저장 실패:/)).toBeInTheDocument()
      })
    })

    test('Should handle concurrent save/delete operations', async () => {
      const user = userEvent.setup()
      render(<APIKeyForm />)

      // Save multiple keys rapidly
      const keys = [
        { input: screen.getByPlaceholderText('sk-ant-api...'), value: 'sk-ant-key-1', index: 0 },
        { input: screen.getByPlaceholderText('sk-...'), value: 'sk-key-2', index: 1 },
        { input: screen.getByPlaceholderText('pplx-...'), value: 'pplx-key-3', index: 2 }
      ]

      const saveButtons = screen.getAllByText('저장')

      // Rapid fire saves
      for (const key of keys) {
        await user.type(key.input, key.value)
        await user.click(saveButtons[key.index])
      }

      // All should succeed despite concurrent operations
      await waitFor(() => {
        expect(encryption.getAPIKey('claude')).toBe('sk-ant-key-1')
        expect(encryption.getAPIKey('chatgpt')).toBe('sk-key-2')
        expect(encryption.getAPIKey('perplexity')).toBe('pplx-key-3')
      })
    })
  })

  describe('Integration: Security Verification', () => {
    test('Should never store API keys in plaintext', async () => {
      const user = userEvent.setup()
      render(<APIKeyForm />)

      const testKey = 'sk-ant-security-test-12345'
      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      await user.type(claudeInput, testKey)

      const saveButtons = screen.getAllByText('저장')
      await user.click(saveButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/API 키가 안전하게 저장되었습니다/)).toBeInTheDocument()
      })

      // Check all localStorage values - none should contain plaintext key
      const allStoredValues = Object.values(localStorageMock)
      const hasPlaintext = allStoredValues.some(value =>
        typeof value === 'string' && value.includes(testKey)
      )

      expect(hasPlaintext).toBe(false)
    })

    test('Should verify encryption key persistence across sessions', async () => {
      // Save a key
      const testKey = 'sk-ant-persistence-test'
      encryption.storeAPIKey('claude', testKey)

      // Verify encryption key exists
      const encryptionKey = localStorageMock['__aitax_enc_key__']
      expect(encryptionKey).toBeDefined()

      // Retrieve the key (simulating different session)
      const retrievedKey = encryption.getAPIKey('claude')
      expect(retrievedKey).toBe(testKey)

      // Encryption key should still be there
      expect(localStorageMock['__aitax_enc_key__']).toBe(encryptionKey)
    })

    test('Should mask API keys consistently', async () => {
      const testKeys = [
        { key: 'sk-ant-test-key-12345678', expectedFormat: 'first8...last4' },
        { key: 'sk-very-long-api-key-with-many-characters-123456789', expectedFormat: 'first8...last4' },
        { key: 'pplx-short', expectedFormat: 'bullets' } // Less than 12 chars
      ]

      for (const { key, expectedFormat } of testKeys) {
        const masked = encryption.maskAPIKey(key)

        // Should not expose full key
        expect(masked).not.toBe(key)

        // Should not be empty
        expect(masked.length).toBeGreaterThan(0)

        if (expectedFormat === 'first8...last4') {
          // For keys >= 12 chars: "first8...last4" format
          const first8 = key.substring(0, 8)
          const last4 = key.substring(key.length - 4)

          expect(masked).toBe(`${first8}...${last4}`)
          expect(masked).toContain('...')
          expect(masked).toContain(first8)
          expect(masked).toContain(last4)
        } else {
          // For short keys: all bullets
          expect(masked).toMatch(/^•+$/)
        }
      }
    })
  })
})

/**
 * APIKeyForm Component Tests
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import APIKeyForm from './APIKeyForm'
import * as encryption from '../utils/encryption'
import * as apiKeyValidator from '../utils/apiKeyValidator'

// Mock dependencies
jest.mock('../utils/encryption')
jest.mock('../utils/apiKeyValidator')

describe('APIKeyForm Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()

    // Default mock implementations
    encryption.getAPIKey.mockReturnValue(null)
    encryption.storeAPIKey.mockImplementation(() => {})
    encryption.removeAPIKey.mockImplementation(() => {})
    encryption.maskAPIKey.mockImplementation((key) => {
      if (!key || key.length <= 4) return '••••••••'
      return '•'.repeat(8) + key.slice(-4)
    })

    // Mock window.confirm
    global.confirm = jest.fn(() => true)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Rendering and Initial State', () => {
    test('Should render form header and description', () => {
      render(<APIKeyForm />)

      expect(screen.getByText('API 키 관리')).toBeInTheDocument()
      expect(screen.getByText(/AI 세무 분석을 위한 API 키/)).toBeInTheDocument()
    })

    test('Should render all API providers', () => {
      render(<APIKeyForm />)

      expect(screen.getByText('Claude (Anthropic)')).toBeInTheDocument()
      expect(screen.getByText('ChatGPT (OpenAI)')).toBeInTheDocument()
      expect(screen.getByText('Perplexity AI')).toBeInTheDocument()
    })

    test('Should render security notice', () => {
      render(<APIKeyForm />)

      expect(screen.getByText('🔒 보안 정보')).toBeInTheDocument()
      expect(screen.getByText(/AES-256 암호화/)).toBeInTheDocument()
    })

    test('Should render input fields for all providers when no keys saved', () => {
      render(<APIKeyForm />)

      const inputs = screen.getAllByPlaceholderText(/sk-|pplx-/)
      expect(inputs).toHaveLength(3)
    })

    test('Should load saved keys on mount', () => {
      encryption.getAPIKey.mockImplementation((provider) => {
        if (provider === 'claude') return 'sk-ant-test123'
        return null
      })

      render(<APIKeyForm />)

      expect(encryption.getAPIKey).toHaveBeenCalledWith('claude')
      expect(encryption.getAPIKey).toHaveBeenCalledWith('chatgpt')
      expect(encryption.getAPIKey).toHaveBeenCalledWith('perplexity')
    })
  })

  describe('Input Handling', () => {
    test('Should update input value on change', async () => {
      render(<APIKeyForm />)
      const user = userEvent.setup()

      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      await user.type(claudeInput, 'sk-ant-test123')

      expect(claudeInput.value).toBe('sk-ant-test123')
    })

    test('Should handle input for all providers independently', async () => {
      render(<APIKeyForm />)
      const user = userEvent.setup()

      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      const chatgptInput = screen.getByPlaceholderText('sk-...')
      const perplexityInput = screen.getByPlaceholderText('pplx-...')

      await user.type(claudeInput, 'claude-key')
      await user.type(chatgptInput, 'chatgpt-key')
      await user.type(perplexityInput, 'perplexity-key')

      expect(claudeInput.value).toBe('claude-key')
      expect(chatgptInput.value).toBe('chatgpt-key')
      expect(perplexityInput.value).toBe('perplexity-key')
    })

    test('Should limit input to 200 characters', () => {
      render(<APIKeyForm />)

      const inputs = screen.getAllByPlaceholderText(/sk-|pplx-/)
      inputs.forEach(input => {
        expect(input).toHaveAttribute('maxLength', '200')
      })
    })
  })

  describe('Show/Hide Password Toggle', () => {
    test('Should toggle password visibility for Claude key', async () => {
      render(<APIKeyForm />)
      const user = userEvent.setup()

      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      const toggleButtons = screen.getAllByTitle(/보기|숨기기/)
      const claudeToggle = toggleButtons[0]

      // Initially password type
      expect(claudeInput).toHaveAttribute('type', 'password')

      // Click toggle to show
      await user.click(claudeToggle)
      expect(claudeInput).toHaveAttribute('type', 'text')

      // Click toggle to hide
      await user.click(claudeToggle)
      expect(claudeInput).toHaveAttribute('type', 'password')
    })

    test('Should toggle independently for each provider', async () => {
      render(<APIKeyForm />)
      const user = userEvent.setup()

      const inputs = screen.getAllByPlaceholderText(/sk-|pplx-/)
      const toggleButtons = screen.getAllByTitle(/보기|숨기기/)

      // Toggle Claude only
      await user.click(toggleButtons[0])
      expect(inputs[0]).toHaveAttribute('type', 'text')
      expect(inputs[1]).toHaveAttribute('type', 'password')
      expect(inputs[2]).toHaveAttribute('type', 'password')
    })
  })

  describe('Save Functionality', () => {
    test('Should save API key successfully', async () => {
      render(<APIKeyForm />)
      const user = userEvent.setup()

      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      const saveButtons = screen.getAllByText('저장')

      await user.type(claudeInput, 'sk-ant-test123')
      await user.click(saveButtons[0])

      expect(encryption.storeAPIKey).toHaveBeenCalledWith('claude', 'sk-ant-test123')
      expect(screen.getByText(/API 키가 안전하게 저장되었습니다/)).toBeInTheDocument()
    })

    test('Should show error when saving empty key', async () => {
      render(<APIKeyForm />)
      const user = userEvent.setup()

      const saveButtons = screen.getAllByText('저장')
      await user.click(saveButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/API 키를 입력해주세요/)).toBeInTheDocument()
      })
      expect(encryption.storeAPIKey).not.toHaveBeenCalled()
    })

    test('Should clear input after successful save', async () => {
      render(<APIKeyForm />)
      const user = userEvent.setup()

      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      const saveButtons = screen.getAllByText('저장')

      await user.type(claudeInput, 'sk-ant-test123')
      await user.click(saveButtons[0])

      await waitFor(() => {
        expect(claudeInput.value).toBe('')
      }, { timeout: 3000 })
    })

    test('Should handle save error', async () => {
      encryption.storeAPIKey.mockImplementation(() => {
        throw new Error('Storage failed')
      })

      render(<APIKeyForm />)
      const user = userEvent.setup()

      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      const saveButtons = screen.getAllByText('저장')

      await user.type(claudeInput, 'sk-ant-test123')
      await user.click(saveButtons[0])

      expect(screen.getByText(/저장 실패: Storage failed/)).toBeInTheDocument()
    })

    test('Should disable save button when input is empty', () => {
      render(<APIKeyForm />)

      const saveButtons = screen.getAllByText('저장')
      saveButtons.forEach(button => {
        expect(button).toBeDisabled()
      })
    })

    test('Should enable save button when input has value', async () => {
      render(<APIKeyForm />)
      const user = userEvent.setup()

      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      const saveButtons = screen.getAllByText('저장')

      await user.type(claudeInput, 'sk-ant-test123')

      expect(saveButtons[0]).not.toBeDisabled()
    })
  })

  describe('Validation Functionality', () => {
    test('Should validate API key successfully', async () => {
      apiKeyValidator.validateAPIKey.mockResolvedValue({
        valid: true,
        message: 'Claude API 키가 유효합니다'
      })

      render(<APIKeyForm />)
      const user = userEvent.setup()

      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      const validateButtons = screen.getAllByText('키 검증')

      await user.type(claudeInput, 'sk-ant-test123')
      await user.click(validateButtons[0])

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/Claude API 키가 유효합니다/)).toBeInTheDocument()
      }, { timeout: 3000 })

      expect(apiKeyValidator.validateAPIKey).toHaveBeenCalledWith('claude', 'sk-ant-test123')
    })

    test('Should show error for invalid API key', async () => {
      apiKeyValidator.validateAPIKey.mockResolvedValue({
        valid: false,
        message: 'API 키가 유효하지 않습니다 (401 Unauthorized)'
      })

      render(<APIKeyForm />)
      const user = userEvent.setup()

      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      const validateButtons = screen.getAllByText('키 검증')

      await user.type(claudeInput, 'sk-ant-invalid')
      await user.click(validateButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/API 키가 유효하지 않습니다/)).toBeInTheDocument()
      })
    })

    test('Should show error when validating empty key', async () => {
      render(<APIKeyForm />)
      const user = userEvent.setup()

      const validateButtons = screen.getAllByText('키 검증')
      await user.click(validateButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/API 키를 입력해주세요/)).toBeInTheDocument()
      })
      expect(apiKeyValidator.validateAPIKey).not.toHaveBeenCalled()
    })

    test('Should disable validate button during validation', async () => {
      apiKeyValidator.validateAPIKey.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ valid: true, message: 'OK' }), 100))
      )

      render(<APIKeyForm />)
      const user = userEvent.setup()

      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      const validateButtons = screen.getAllByText('키 검증')

      await user.type(claudeInput, 'sk-ant-test123')
      await user.click(validateButtons[0])

      const validatingButton = await screen.findByText('검증 중...')
      expect(validatingButton).toBeDisabled()
    })

    test('Should handle validation network error', async () => {
      apiKeyValidator.validateAPIKey.mockRejectedValue(new Error('Network error'))

      render(<APIKeyForm />)
      const user = userEvent.setup()

      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      const validateButtons = screen.getAllByText('키 검증')

      await user.type(claudeInput, 'sk-ant-test123')
      await user.click(validateButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/검증 실패: Network error/)).toBeInTheDocument()
      })
    })

    test('Should display validation result icon', async () => {
      apiKeyValidator.validateAPIKey.mockResolvedValue({
        valid: true,
        message: 'Valid'
      })

      render(<APIKeyForm />)
      const user = userEvent.setup()

      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      const validateButtons = screen.getAllByText('키 검증')

      await user.type(claudeInput, 'sk-ant-test123')
      await user.click(validateButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/✅/)).toBeInTheDocument()
      })
    })
  })

  describe('Delete Functionality', () => {
    test('Should display saved key with masked value', () => {
      encryption.getAPIKey.mockImplementation((provider) => {
        if (provider === 'claude') return 'sk-ant-test1234567890'
        return null
      })
      encryption.maskAPIKey.mockReturnValue('••••••••7890')

      render(<APIKeyForm />)

      expect(screen.getByText('••••••••7890')).toBeInTheDocument()
      expect(screen.getByText('✅ 저장됨')).toBeInTheDocument()
    })

    test('Should delete saved key with confirmation', async () => {
      encryption.getAPIKey.mockImplementation((provider) => {
        if (provider === 'claude') return 'sk-ant-test123'
        return null
      })
      global.confirm.mockReturnValue(true)

      render(<APIKeyForm />)
      const user = userEvent.setup()

      const deleteButtons = screen.getAllByText('삭제')
      await user.click(deleteButtons[0])

      expect(global.confirm).toHaveBeenCalledWith(expect.stringContaining('삭제하시겠습니까'))
      expect(encryption.removeAPIKey).toHaveBeenCalledWith('claude')

      await waitFor(() => {
        expect(screen.getByText(/API 키가 삭제되었습니다/)).toBeInTheDocument()
      })
    })

    test('Should not delete if confirmation is cancelled', async () => {
      encryption.getAPIKey.mockImplementation((provider) => {
        if (provider === 'claude') return 'sk-ant-test123'
        return null
      })
      global.confirm.mockReturnValue(false)

      render(<APIKeyForm />)
      const user = userEvent.setup()

      const deleteButtons = screen.getAllByText('삭제')
      await user.click(deleteButtons[0])

      expect(encryption.removeAPIKey).not.toHaveBeenCalled()
    })

    test('Should handle delete error', async () => {
      encryption.getAPIKey.mockImplementation((provider) => {
        if (provider === 'claude') return 'sk-ant-test123'
        return null
      })
      encryption.removeAPIKey.mockImplementation(() => {
        throw new Error('Delete failed')
      })
      global.confirm.mockReturnValue(true)

      render(<APIKeyForm />)
      const user = userEvent.setup()

      const deleteButtons = screen.getAllByText('삭제')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/삭제 실패: Delete failed/)).toBeInTheDocument()
      })
    })
  })

  describe('Cancel Button', () => {
    test('Should clear input when cancel is clicked', async () => {
      render(<APIKeyForm />)
      const user = userEvent.setup()

      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      const cancelButtons = screen.getAllByText('취소')

      await user.type(claudeInput, 'sk-ant-test123')
      expect(claudeInput.value).toBe('sk-ant-test123')

      await user.click(cancelButtons[0])
      expect(claudeInput.value).toBe('')
    })

    test('Should disable cancel button when input is empty', () => {
      render(<APIKeyForm />)

      const cancelButtons = screen.getAllByText('취소')
      cancelButtons.forEach(button => {
        expect(button).toBeDisabled()
      })
    })
  })

  describe('Message Display', () => {
    test('Should auto-hide success message after 3 seconds', async () => {
      jest.useFakeTimers()

      render(<APIKeyForm />)
      const user = userEvent.setup({ delay: null })

      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      const saveButtons = screen.getAllByText('저장')

      await user.type(claudeInput, 'sk-ant-test123')
      await user.click(saveButtons[0])

      expect(screen.getByText(/API 키가 안전하게 저장되었습니다/)).toBeInTheDocument()

      // Fast-forward time by 3 seconds
      jest.advanceTimersByTime(3000)

      await waitFor(() => {
        expect(screen.queryByText(/API 키가 안전하게 저장되었습니다/)).not.toBeInTheDocument()
      })

      jest.useRealTimers()
    })

    test('Should auto-hide validation message after 5 seconds', async () => {
      jest.useFakeTimers()

      apiKeyValidator.validateAPIKey.mockResolvedValue({
        valid: true,
        message: 'Valid key'
      })

      render(<APIKeyForm />)
      const user = userEvent.setup({ delay: null })

      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      const validateButtons = screen.getAllByText('키 검증')

      await user.type(claudeInput, 'sk-ant-test123')
      await user.click(validateButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/Valid key/)).toBeInTheDocument()
      })

      // Fast-forward time by 5 seconds
      jest.advanceTimersByTime(5000)

      await waitFor(() => {
        expect(screen.queryByText(/Valid key/)).not.toBeInTheDocument()
      })

      jest.useRealTimers()
    })
  })
})

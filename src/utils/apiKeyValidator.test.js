/**
 * API Key Validator Unit Tests
 * @jest-environment node
 */

import {
  validateClaudeKey,
  validateChatGPTKey,
  validatePerplexityKey,
  validateAPIKey
} from './apiKeyValidator.js'

// Mock fetch globally
global.fetch = jest.fn()

describe('API Key Validator', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  describe('validateClaudeKey', () => {
    test('Should reject key without sk-ant- prefix', async () => {
      const result = await validateClaudeKey('invalid-key')

      expect(result.valid).toBe(false)
      expect(result.message).toContain('sk-ant-')
      expect(fetch).not.toHaveBeenCalled()
    })

    test('Should reject empty key', async () => {
      const result = await validateClaudeKey('')

      expect(result.valid).toBe(false)
      expect(fetch).not.toHaveBeenCalled()
    })

    test('Should reject null key', async () => {
      const result = await validateClaudeKey(null)

      expect(result.valid).toBe(false)
      expect(fetch).not.toHaveBeenCalled()
    })

    test('Should validate valid key successfully (200 OK)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      const result = await validateClaudeKey('sk-ant-api03-test123')

      expect(result.valid).toBe(true)
      expect(result.message).toContain('유효합니다')
      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': 'sk-ant-api03-test123'
          })
        })
      )
    })

    test('Should reject invalid key (401 Unauthorized)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      })

      const result = await validateClaudeKey('sk-ant-invalid')

      expect(result.valid).toBe(false)
      expect(result.message).toContain('401')
      expect(result.message).toContain('Unauthorized')
    })

    test('Should handle rate limit (429) as valid key', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 429
      })

      const result = await validateClaudeKey('sk-ant-api03-test123')

      expect(result.valid).toBe(true)
      expect(result.message).toContain('429')
      expect(result.message).toContain('한도')
    })

    test('Should handle other API errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      const result = await validateClaudeKey('sk-ant-api03-test123')

      expect(result.valid).toBe(false)
      expect(result.message).toContain('500')
    })

    test('Should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network failure'))

      const result = await validateClaudeKey('sk-ant-api03-test123')

      expect(result.valid).toBe(false)
      expect(result.message).toContain('네트워크')
      expect(result.message).toContain('Network failure')
    })
  })

  describe('validateChatGPTKey', () => {
    test('Should reject key without sk- prefix', async () => {
      const result = await validateChatGPTKey('invalid-key')

      expect(result.valid).toBe(false)
      expect(result.message).toContain('sk-')
      expect(fetch).not.toHaveBeenCalled()
    })

    test('Should reject empty key', async () => {
      const result = await validateChatGPTKey('')

      expect(result.valid).toBe(false)
      expect(fetch).not.toHaveBeenCalled()
    })

    test('Should reject null key', async () => {
      const result = await validateChatGPTKey(null)

      expect(result.valid).toBe(false)
      expect(fetch).not.toHaveBeenCalled()
    })

    test('Should validate valid key successfully (200 OK)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      const result = await validateChatGPTKey('sk-test123456789')

      expect(result.valid).toBe(true)
      expect(result.message).toContain('유효합니다')
      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/models',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer sk-test123456789'
          })
        })
      )
    })

    test('Should reject invalid key (401 Unauthorized)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      })

      const result = await validateChatGPTKey('sk-invalid')

      expect(result.valid).toBe(false)
      expect(result.message).toContain('401')
    })

    test('Should handle rate limit (429) as valid key', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 429
      })

      const result = await validateChatGPTKey('sk-test123')

      expect(result.valid).toBe(true)
      expect(result.message).toContain('429')
    })

    test('Should handle other API errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 503
      })

      const result = await validateChatGPTKey('sk-test123')

      expect(result.valid).toBe(false)
      expect(result.message).toContain('503')
    })

    test('Should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Connection timeout'))

      const result = await validateChatGPTKey('sk-test123')

      expect(result.valid).toBe(false)
      expect(result.message).toContain('네트워크')
    })
  })

  describe('validatePerplexityKey', () => {
    test('Should reject key without pplx- prefix', async () => {
      const result = await validatePerplexityKey('invalid-key')

      expect(result.valid).toBe(false)
      expect(result.message).toContain('pplx-')
      expect(fetch).not.toHaveBeenCalled()
    })

    test('Should reject empty key', async () => {
      const result = await validatePerplexityKey('')

      expect(result.valid).toBe(false)
      expect(fetch).not.toHaveBeenCalled()
    })

    test('Should reject null key', async () => {
      const result = await validatePerplexityKey(null)

      expect(result.valid).toBe(false)
      expect(fetch).not.toHaveBeenCalled()
    })

    test('Should validate valid key successfully (200 OK)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      const result = await validatePerplexityKey('pplx-test123')

      expect(result.valid).toBe(true)
      expect(result.message).toContain('유효합니다')
      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenCalledWith(
        'https://api.perplexity.ai/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer pplx-test123'
          })
        })
      )
    })

    test('Should reject invalid key (401 Unauthorized)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      })

      const result = await validatePerplexityKey('pplx-invalid')

      expect(result.valid).toBe(false)
      expect(result.message).toContain('401')
    })

    test('Should handle rate limit (429) as valid key', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 429
      })

      const result = await validatePerplexityKey('pplx-test123')

      expect(result.valid).toBe(true)
      expect(result.message).toContain('429')
    })

    test('Should handle other API errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      const result = await validatePerplexityKey('pplx-test123')

      expect(result.valid).toBe(false)
      expect(result.message).toContain('404')
    })

    test('Should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('DNS resolution failed'))

      const result = await validatePerplexityKey('pplx-test123')

      expect(result.valid).toBe(false)
      expect(result.message).toContain('네트워크')
    })
  })

  describe('validateAPIKey (Unified Interface)', () => {
    test('Should route to Claude validator', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      const result = await validateAPIKey('claude', 'sk-ant-test123')

      expect(result.valid).toBe(true)
      expect(fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.any(Object)
      )
    })

    test('Should route to ChatGPT validator', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      const result = await validateAPIKey('chatgpt', 'sk-test123')

      expect(result.valid).toBe(true)
      expect(fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/models',
        expect.any(Object)
      )
    })

    test('Should route to Perplexity validator', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      const result = await validateAPIKey('perplexity', 'pplx-test123')

      expect(result.valid).toBe(true)
      expect(fetch).toHaveBeenCalledWith(
        'https://api.perplexity.ai/chat/completions',
        expect.any(Object)
      )
    })

    test('Should reject unsupported provider', async () => {
      const result = await validateAPIKey('unknown', 'test-key')

      expect(result.valid).toBe(false)
      expect(result.message).toContain('지원하지 않는')
      expect(fetch).not.toHaveBeenCalled()
    })

    test('Should handle empty provider', async () => {
      const result = await validateAPIKey('', 'test-key')

      expect(result.valid).toBe(false)
    })

    test('Should handle null provider', async () => {
      const result = await validateAPIKey(null, 'test-key')

      expect(result.valid).toBe(false)
    })

    test('Should propagate validation errors from specific validators', async () => {
      const result = await validateAPIKey('claude', 'invalid-key')

      expect(result.valid).toBe(false)
      expect(result.message).toContain('sk-ant-')
    })
  })

  describe('Edge Cases', () => {
    test('Should handle keys with special characters', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      const result = await validateClaudeKey('sk-ant-api03-test-123_ABC')

      expect(result.valid).toBe(true)
    })

    test('Should handle very long keys', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      const longKey = 'sk-ant-' + 'x'.repeat(100)
      const result = await validateClaudeKey(longKey)

      expect(result.valid).toBe(true)
    })

    test('Should handle keys with whitespace (should fail)', async () => {
      const result = await validateClaudeKey('sk-ant- with spaces')

      // This should still validate prefix, but will likely fail on API call
      // We're just testing it doesn't crash
      expect(result).toHaveProperty('valid')
      expect(result).toHaveProperty('message')
    })

    test('Should handle concurrent validations', async () => {
      fetch
        .mockResolvedValueOnce({ ok: true, status: 200 })
        .mockResolvedValueOnce({ ok: true, status: 200 })
        .mockResolvedValueOnce({ ok: true, status: 200 })

      const results = await Promise.all([
        validateClaudeKey('sk-ant-test1'),
        validateChatGPTKey('sk-test2'),
        validatePerplexityKey('pplx-test3')
      ])

      expect(results).toHaveLength(3)
      expect(results.every(r => r.valid)).toBe(true)
      expect(fetch).toHaveBeenCalledTimes(3)
    })

    test('Should handle fetch timeout simulation', async () => {
      fetch.mockImplementationOnce(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      )

      const result = await validateClaudeKey('sk-ant-test123')

      expect(result.valid).toBe(false)
      expect(result.message).toContain('Timeout')
    })
  })

  describe('API Request Details', () => {
    test('Claude API should use correct headers', async () => {
      fetch.mockResolvedValueOnce({ ok: true, status: 200 })

      await validateClaudeKey('sk-ant-test123')

      expect(fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-api-key': 'sk-ant-test123',
            'anthropic-version': '2023-06-01'
          })
        })
      )
    })

    test('Claude API should send correct test request', async () => {
      fetch.mockResolvedValueOnce({ ok: true, status: 200 })

      await validateClaudeKey('sk-ant-test123')

      const call = fetch.mock.calls[0]
      const body = JSON.parse(call[1].body)

      expect(body).toEqual({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: 'test'
        }]
      })
    })

    test('ChatGPT API should use Bearer token', async () => {
      fetch.mockResolvedValueOnce({ ok: true, status: 200 })

      await validateChatGPTKey('sk-test123')

      expect(fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/models',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer sk-test123'
          })
        })
      )
    })

    test('Perplexity API should send correct test request', async () => {
      fetch.mockResolvedValueOnce({ ok: true, status: 200 })

      await validatePerplexityKey('pplx-test123')

      const call = fetch.mock.calls[0]
      const body = JSON.parse(call[1].body)

      expect(body).toEqual({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [{
          role: 'user',
          content: 'test'
        }],
        max_tokens: 10
      })
    })
  })
})

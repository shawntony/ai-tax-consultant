/**
 * API Key Validator
 *
 * AI API 키 유효성 검증
 *
 * @module utils/apiKeyValidator
 * @version 1.0.0
 * @date 2024-10-18
 */

/**
 * Claude API 키 테스트
 * @param {string} apiKey - Anthropic Claude API 키
 * @returns {Promise<{valid: boolean, message: string}>}
 */
export async function validateClaudeKey(apiKey) {
  if (!apiKey || !apiKey.startsWith('sk-ant-')) {
    return {
      valid: false,
      message: 'Claude API 키는 sk-ant-로 시작해야 합니다'
    };
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: 'test'
        }]
      })
    });

    if (response.ok) {
      return {
        valid: true,
        message: 'Claude API 키가 유효합니다'
      };
    } else if (response.status === 401) {
      return {
        valid: false,
        message: 'API 키가 유효하지 않습니다 (401 Unauthorized)'
      };
    } else if (response.status === 429) {
      return {
        valid: true,
        message: 'API 키는 유효하지만 요청 한도를 초과했습니다 (429)'
      };
    } else {
      return {
        valid: false,
        message: `API 오류 (${response.status})`
      };
    }
  } catch (error) {
    return {
      valid: false,
      message: `네트워크 오류: ${error.message}`
    };
  }
}

/**
 * ChatGPT (OpenAI) API 키 테스트
 * @param {string} apiKey - OpenAI API 키
 * @returns {Promise<{valid: boolean, message: string}>}
 */
export async function validateChatGPTKey(apiKey) {
  if (!apiKey || !apiKey.startsWith('sk-')) {
    return {
      valid: false,
      message: 'OpenAI API 키는 sk-로 시작해야 합니다'
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      return {
        valid: true,
        message: 'ChatGPT API 키가 유효합니다'
      };
    } else if (response.status === 401) {
      return {
        valid: false,
        message: 'API 키가 유효하지 않습니다 (401 Unauthorized)'
      };
    } else if (response.status === 429) {
      return {
        valid: true,
        message: 'API 키는 유효하지만 요청 한도를 초과했습니다 (429)'
      };
    } else {
      return {
        valid: false,
        message: `API 오류 (${response.status})`
      };
    }
  } catch (error) {
    return {
      valid: false,
      message: `네트워크 오류: ${error.message}`
    };
  }
}

/**
 * Perplexity AI API 키 테스트
 * @param {string} apiKey - Perplexity API 키
 * @returns {Promise<{valid: boolean, message: string}>}
 */
export async function validatePerplexityKey(apiKey) {
  if (!apiKey || !apiKey.startsWith('pplx-')) {
    return {
      valid: false,
      message: 'Perplexity API 키는 pplx-로 시작해야 합니다'
    };
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [{
          role: 'user',
          content: 'test'
        }],
        max_tokens: 10
      })
    });

    if (response.ok) {
      return {
        valid: true,
        message: 'Perplexity API 키가 유효합니다'
      };
    } else if (response.status === 401) {
      return {
        valid: false,
        message: 'API 키가 유효하지 않습니다 (401 Unauthorized)'
      };
    } else if (response.status === 429) {
      return {
        valid: true,
        message: 'API 키는 유효하지만 요청 한도를 초과했습니다 (429)'
      };
    } else {
      return {
        valid: false,
        message: `API 오류 (${response.status})`
      };
    }
  } catch (error) {
    return {
      valid: false,
      message: `네트워크 오류: ${error.message}`
    };
  }
}

/**
 * API 키 유효성 검증 (통합)
 * @param {string} provider - 'claude' | 'chatgpt' | 'perplexity'
 * @param {string} apiKey - API 키
 * @returns {Promise<{valid: boolean, message: string}>}
 */
export async function validateAPIKey(provider, apiKey) {
  switch (provider) {
    case 'claude':
      return await validateClaudeKey(apiKey);
    case 'chatgpt':
      return await validateChatGPTKey(apiKey);
    case 'perplexity':
      return await validatePerplexityKey(apiKey);
    default:
      return {
        valid: false,
        message: '지원하지 않는 AI 제공자입니다'
      };
  }
}

export default {
  validateClaudeKey,
  validateChatGPTKey,
  validatePerplexityKey,
  validateAPIKey
};

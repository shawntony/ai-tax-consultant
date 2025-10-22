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
 * Claude API 키 테스트 (프록시 서버 사용)
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
    const response = await fetch('http://localhost:3001/api/validate/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ apiKey })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      valid: false,
      message: `프록시 서버 연결 오류: ${error.message}. 프록시 서버가 실행 중인지 확인하세요.`
    };
  }
}

/**
 * ChatGPT (OpenAI) API 키 테스트 (프록시 서버 사용)
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
    const response = await fetch('http://localhost:3001/api/validate/chatgpt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ apiKey })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      valid: false,
      message: `프록시 서버 연결 오류: ${error.message}. 프록시 서버가 실행 중인지 확인하세요.`
    };
  }
}

/**
 * Perplexity AI API 키 테스트 (프록시 서버 사용)
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
    const response = await fetch('http://localhost:3001/api/validate/perplexity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ apiKey })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      valid: false,
      message: `프록시 서버 연결 오류: ${error.message}. 프록시 서버가 실행 중인지 확인하세요.`
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

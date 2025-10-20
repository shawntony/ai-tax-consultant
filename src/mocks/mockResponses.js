/**
 * Mock AI API Responses
 *
 * Contains sample responses for Claude, ChatGPT, and Perplexity APIs
 * Used for testing without making actual API calls
 *
 * @module mocks/mockResponses
 * @version 1.0.0
 * @date 2024-10-18
 */

/**
 * Mock Claude API Response (Success)
 */
export const claudeSuccessResponse = {
  id: 'msg_01AbCdEfGhIjKlMnOpQrStUv',
  type: 'message',
  role: 'assistant',
  model: 'claude-3-sonnet-20240229',
  content: [
    {
      type: 'text',
      text: JSON.stringify({
        taxType: ['inheritance'],
        deceased: {
          age: 65,
          deathDate: '2024-01-15'
        },
        estate: {
          totalValue: 3000000000,
          realEstate: 2000000000,
          deposits: 800000000,
          stocks: 200000000
        },
        debts: 100000000,
        heirs: [
          {
            relation: 'spouse',
            name: '배우자',
            count: 1
          },
          {
            relation: 'children',
            name: '자녀',
            count: 2
          }
        ],
        scenarios: [
          {
            name: '기본 상속 (법정상속)',
            inheritanceTax: 450000000,
            perHeirAmount: {
              spouse: 1450000000,
              children: 725000000
            }
          },
          {
            name: '배우자 증여 후 상속',
            inheritanceTax: 280000000,
            perHeirAmount: {
              spouse: 800000000,
              children: 1033333333
            }
          }
        ]
      })
    }
  ],
  stop_reason: 'end_turn',
  usage: {
    input_tokens: 234,
    output_tokens: 156
  }
};

/**
 * Mock ChatGPT API Response (Success)
 */
export const chatgptSuccessResponse = {
  id: 'chatcmpl-8abcdefghijklmnop',
  object: 'chat.completion',
  created: 1704067200,
  model: 'gpt-4-turbo-preview',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: JSON.stringify({
          taxType: ['gift'],
          donor: {
            name: '증여자',
            relation: 'parent'
          },
          recipient: {
            name: '수증자',
            age: 25,
            relation: 'child'
          },
          property: {
            type: 'cash',
            value: 200000000
          },
          scenarios: [
            {
              name: '일시 증여',
              giftTax: 24000000,
              effectiveRate: 12
            },
            {
              name: '분할 증여 (5천만원씩 10년 간격 4회)',
              giftTax: 0,
              effectiveRate: 0,
              notes: '공제 한도 내 비과세'
            }
          ]
        })
      },
      finish_reason: 'stop'
    }
  ],
  usage: {
    prompt_tokens: 187,
    completion_tokens: 142,
    total_tokens: 329
  }
};

/**
 * Mock Perplexity API Response (Success)
 */
export const perplexitySuccessResponse = {
  id: 'pplx_abc123def456',
  model: 'pplx-7b-online',
  created: 1704067200,
  usage: {
    prompt_tokens: 156,
    completion_tokens: 201,
    total_tokens: 357
  },
  choices: [
    {
      index: 0,
      finish_reason: 'stop',
      message: {
        role: 'assistant',
        content: JSON.stringify({
          taxType: ['capital-gains'],
          property: {
            type: '1세대1주택',
            acquisitionDate: '2019-01-15',
            transferDate: '2024-06-20',
            acquisitionPrice: 500000000,
            transferPrice: 800000000,
            address: '서울특별시 강남구'
          },
          holdingPeriod: {
            years: 5,
            months: 5
          },
          capitalGain: 300000000,
          exemption: {
            eligible: true,
            reason: '1세대1주택 비과세 (보유 2년 이상, 거주 2년 이상)',
            taxAmount: 0
          },
          scenarios: [
            {
              name: '1세대1주택 비과세',
              tax: 0,
              notes: '비과세 요건 충족'
            }
          ]
        })
      },
      delta: {
        role: 'assistant',
        content: ''
      }
    }
  ]
};

/**
 * Mock Error Responses
 */

/**
 * 401 Unauthorized - Invalid API Key
 */
export const error401Response = {
  error: {
    type: 'invalid_request_error',
    message: 'Invalid API key provided'
  }
};

/**
 * 429 Rate Limit Exceeded
 */
export const error429Response = {
  error: {
    type: 'rate_limit_error',
    message: 'Rate limit exceeded. Please try again later.'
  }
};

/**
 * 500 Internal Server Error
 */
export const error500Response = {
  error: {
    type: 'internal_server_error',
    message: 'The server encountered an internal error and was unable to complete your request'
  }
};

/**
 * Network Timeout (simulated)
 */
export const errorTimeoutResponse = {
  error: {
    type: 'timeout_error',
    message: 'Request timed out'
  }
};

/**
 * Invalid Response Format
 */
export const errorInvalidFormatResponse = {
  content: 'This is not a valid JSON response'
};

/**
 * Mock response by provider and scenario
 *
 * @param {string} provider - 'claude' | 'chatgpt' | 'perplexity'
 * @param {string} scenario - 'success' | '401' | '429' | '500' | 'timeout' | 'invalid'
 * @returns {Object} Mock response
 */
export function getMockResponse(provider, scenario = 'success') {
  // Success responses
  if (scenario === 'success') {
    switch (provider) {
      case 'claude':
        return claudeSuccessResponse;
      case 'chatgpt':
        return chatgptSuccessResponse;
      case 'perplexity':
        return perplexitySuccessResponse;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  // Error responses (same for all providers)
  switch (scenario) {
    case '401':
      return error401Response;
    case '429':
      return error429Response;
    case '500':
      return error500Response;
    case 'timeout':
      return errorTimeoutResponse;
    case 'invalid':
      return errorInvalidFormatResponse;
    default:
      throw new Error(`Unknown scenario: ${scenario}`);
  }
}

/**
 * Mock API call with delay
 *
 * @param {string} provider - AI provider
 * @param {string} scenario - Test scenario
 * @param {number} delay - Delay in milliseconds (default: 1000)
 * @returns {Promise<Object>} Mock response
 */
export async function mockAPICall(provider, scenario = 'success', delay = 1000) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, delay));

  const response = getMockResponse(provider, scenario);

  // Simulate HTTP status codes
  if (scenario === '401') {
    throw new Error('HTTP 401: Unauthorized');
  } else if (scenario === '429') {
    throw new Error('HTTP 429: Too Many Requests');
  } else if (scenario === '500') {
    throw new Error('HTTP 500: Internal Server Error');
  } else if (scenario === 'timeout') {
    throw new Error('Request timeout');
  }

  return response;
}

/**
 * Parse AI response to extract structured data
 *
 * @param {Object} response - AI API response
 * @param {string} provider - 'claude' | 'chatgpt' | 'perplexity'
 * @returns {Object} Parsed structured data
 */
export function parseAIResponse(response, provider) {
  let content;

  switch (provider) {
    case 'claude':
      content = response.content[0].text;
      break;
    case 'chatgpt':
      content = response.choices[0].message.content;
      break;
    case 'perplexity':
      content = response.choices[0].message.content;
      break;
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }

  return JSON.parse(content);
}

export default {
  claudeSuccessResponse,
  chatgptSuccessResponse,
  perplexitySuccessResponse,
  error401Response,
  error429Response,
  error500Response,
  errorTimeoutResponse,
  errorInvalidFormatResponse,
  getMockResponse,
  mockAPICall,
  parseAIResponse
};

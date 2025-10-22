/**
 * Express Proxy Server for API Key Validation
 *
 * CORS 문제 해결을 위한 프록시 서버
 * Claude, OpenAI, Perplexity API 요청을 프록시합니다
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Claude API 키 검증 프록시
 */
app.post('/api/validate/claude', async (req, res) => {
  const { apiKey } = req.body;

  if (!apiKey || !apiKey.startsWith('sk-ant-')) {
    return res.json({
      valid: false,
      message: 'Claude API 키는 sk-ant-로 시작해야 합니다'
    });
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
      return res.json({
        valid: true,
        message: 'Claude API 키가 유효합니다'
      });
    } else if (response.status === 401) {
      return res.json({
        valid: false,
        message: 'API 키가 유효하지 않습니다 (401 Unauthorized)'
      });
    } else if (response.status === 429) {
      return res.json({
        valid: true,
        message: 'API 키는 유효하지만 요청 한도를 초과했습니다 (429)'
      });
    } else {
      const errorText = await response.text();
      return res.json({
        valid: false,
        message: `API 오류 (${response.status}): ${errorText}`
      });
    }
  } catch (error) {
    console.error('Claude validation error:', error);
    return res.status(500).json({
      valid: false,
      message: `서버 오류: ${error.message}`
    });
  }
});

/**
 * ChatGPT (OpenAI) API 키 검증 프록시
 */
app.post('/api/validate/chatgpt', async (req, res) => {
  const { apiKey } = req.body;

  if (!apiKey || !apiKey.startsWith('sk-')) {
    return res.json({
      valid: false,
      message: 'OpenAI API 키는 sk-로 시작해야 합니다'
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      return res.json({
        valid: true,
        message: 'ChatGPT API 키가 유효합니다'
      });
    } else if (response.status === 401) {
      return res.json({
        valid: false,
        message: 'API 키가 유효하지 않습니다 (401 Unauthorized)'
      });
    } else if (response.status === 429) {
      return res.json({
        valid: true,
        message: 'API 키는 유효하지만 요청 한도를 초과했습니다 (429)'
      });
    } else {
      const errorText = await response.text();
      return res.json({
        valid: false,
        message: `API 오류 (${response.status}): ${errorText}`
      });
    }
  } catch (error) {
    console.error('ChatGPT validation error:', error);
    return res.status(500).json({
      valid: false,
      message: `서버 오류: ${error.message}`
    });
  }
});

/**
 * Perplexity API 키 검증 프록시
 */
app.post('/api/validate/perplexity', async (req, res) => {
  const { apiKey } = req.body;

  if (!apiKey || !apiKey.startsWith('pplx-')) {
    return res.json({
      valid: false,
      message: 'Perplexity API 키는 pplx-로 시작해야 합니다'
    });
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{
          role: 'user',
          content: 'test'
        }],
        max_tokens: 10
      })
    });

    if (response.ok) {
      return res.json({
        valid: true,
        message: 'Perplexity API 키가 유효합니다'
      });
    } else if (response.status === 401) {
      return res.json({
        valid: false,
        message: 'API 키가 유효하지 않습니다 (401 Unauthorized)'
      });
    } else if (response.status === 429) {
      return res.json({
        valid: true,
        message: 'API 키는 유효하지만 요청 한도를 초과했습니다 (429)'
      });
    } else {
      const errorText = await response.text();
      return res.json({
        valid: false,
        message: `API 오류 (${response.status}): ${errorText}`
      });
    }
  } catch (error) {
    console.error('Perplexity validation error:', error);
    return res.status(500).json({
      valid: false,
      message: `서버 오류: ${error.message}`
    });
  }
});

/**
 * Tax Strategy Generation - AI 기반 세무 전략 생성
 */
app.post('/api/generate-strategy', async (req, res) => {
  const { collectedInfo } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.REACT_APP_ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: 'ANTHROPIC_API_KEY가 설정되지 않았습니다'
    });
  }

  try {
    const systemPrompt = `당신은 한국 세법 전문가입니다. 증여, 상속, 양도소득세 등에 대해 깊은 지식을 가지고 있으며, 고객에게 최적의 세무 전략을 제안합니다.

주어진 고객 정보를 바탕으로:
1. 가능한 모든 전략 시나리오를 생성하세요
2. 각 시나리오별 세금을 계산하세요
3. 장단점과 리스크를 분석하세요
4. 최적 전략을 추천하세요
5. 단계별 실행 계획을 제시하세요

응답은 반드시 JSON 형식으로만 제공하세요.`;

    const userPrompt = `다음 고객 정보를 바탕으로 최적의 세무 전략을 수립해주세요:

${collectedInfo.formattedText}

다음 JSON 형식으로 응답해주세요:
{
  "scenarios": [
    {
      "name": "전략명",
      "description": "전략 설명",
      "taxCalculation": {
        "giftTax": 0,
        "inheritanceTax": 0,
        "acquisitionTax": 0,
        "capitalGainsTax": 0,
        "totalTax": 0
      },
      "pros": ["장점1", "장점2"],
      "cons": ["단점1", "단점2"],
      "risks": ["리스크1", "리스크2"],
      "timeframe": "예상 소요 기간",
      "complexity": "low|medium|high"
    }
  ],
  "recommendedScenario": "추천 전략명",
  "reasoning": "추천 이유",
  "actionPlan": [
    {
      "step": 1,
      "title": "단계명",
      "description": "단계 설명",
      "duration": "소요 시간",
      "requiredDocuments": ["필요 서류1", "필요 서류2"],
      "estimatedCost": "예상 비용",
      "cautions": ["주의사항1", "주의사항2"],
      "checklist": ["체크항목1", "체크항목2"],
      "costBreakdown": {
        "항목1": "금액1",
        "항목2": "금액2"
      }
    }
  ],
  "nodes": [
    {
      "id": "node1",
      "type": "issue|solution",
      "label": "노드 제목",
      "description": "노드 설명",
      "taxImpact": "세금 영향",
      "dependencies": ["node0"]
    }
  ]
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: userPrompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${errorText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // JSON 파싱 시도
    let strategyData;
    try {
      // JSON 블록 추출 (```json ... ``` 형식)
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      strategyData = JSON.parse(jsonText);
    } catch (parseError) {
      // JSON 파싱 실패 시 기본 구조 반환
      console.error('JSON parsing failed:', parseError);
      strategyData = {
        scenarios: [{
          name: "기본 전략",
          description: content.substring(0, 500),
          taxCalculation: { totalTax: 0 },
          pros: ["분석 중"],
          cons: ["분석 중"],
          risks: ["분석 중"],
          timeframe: "분석 중",
          complexity: "medium"
        }],
        recommendedScenario: "기본 전략",
        reasoning: "상세 분석이 필요합니다",
        actionPlan: [],
        nodes: []
      };
    }

    return res.json({
      success: true,
      strategy: strategyData,
      rawResponse: content
    });

  } catch (error) {
    console.error('Strategy generation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Node Extraction Proxy - Claude API를 서버에서 호출
 */
app.post('/api/extract-nodes', async (req, res) => {
  const { userPrompt, systemPrompt, maxTokens = 8000 } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.REACT_APP_ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'Anthropic API key not configured on server'
    });
  }

  if (!userPrompt) {
    return res.status(400).json({
      error: 'userPrompt is required'
    });
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
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: userPrompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      return res.status(response.status).json({
        error: `Claude API error: ${errorText}`
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Node extraction error:', error);
    return res.status(500).json({
      error: `Server error: ${error.message}`
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Proxy server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
});

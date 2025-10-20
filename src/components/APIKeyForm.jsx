/**
 * API Key Form Component
 *
 * AI API 키 입력, 마스킹, 저장 폼
 *
 * @component APIKeyForm
 * @version 1.0.0
 * @date 2024-10-18
 */

import React, { useState, useEffect } from 'react';
import {
  storeAPIKey,
  getAPIKey,
  removeAPIKey,
  maskAPIKey
} from '../utils/encryption';
import { validateAPIKey } from '../utils/apiKeyValidator';
import './APIKeyForm.css';

const API_PROVIDERS = [
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    placeholder: 'sk-ant-api...',
    description: 'Anthropic Claude API 키 입력'
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT (OpenAI)',
    placeholder: 'sk-...',
    description: 'OpenAI ChatGPT API 키 입력'
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    placeholder: 'pplx-...',
    description: 'Perplexity AI API 키 입력'
  }
];

const APIKeyForm = () => {
  const [apiKeys, setApiKeys] = useState({
    claude: '',
    chatgpt: '',
    perplexity: ''
  });

  const [showKeys, setShowKeys] = useState({
    claude: false,
    chatgpt: false,
    perplexity: false
  });

  const [savedKeys, setSavedKeys] = useState({
    claude: null,
    chatgpt: null,
    perplexity: null
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  const [validating, setValidating] = useState({
    claude: false,
    chatgpt: false,
    perplexity: false
  });

  const [validationResults, setValidationResults] = useState({
    claude: null,
    chatgpt: null,
    perplexity: null
  });

  // 저장된 키 불러오기
  useEffect(() => {
    loadSavedKeys();
  }, []);

  const loadSavedKeys = () => {
    const keys = {};
    API_PROVIDERS.forEach(provider => {
      const savedKey = getAPIKey(provider.id);
      keys[provider.id] = savedKey;
    });
    setSavedKeys(keys);
  };

  const handleInputChange = (provider, value) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));
  };

  const toggleShowKey = (provider) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const handleSave = (provider) => {
    const key = apiKeys[provider];
    
    if (!key || key.trim() === '') {
      setMessage({ type: 'error', text: `${provider} API 키를 입력해주세요` });
      return;
    }

    try {
      storeAPIKey(provider, key);
      setSavedKeys(prev => ({
        ...prev,
        [provider]: key
      }));
      setApiKeys(prev => ({
        ...prev,
        [provider]: ''
      }));
      setMessage({ type: 'success', text: `${provider} API 키가 안전하게 저장되었습니다` });
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: `저장 실패: ${error.message}` });
    }
  };

  const handleValidate = async (provider) => {
    const key = apiKeys[provider];

    if (!key || key.trim() === '') {
      setMessage({ type: 'error', text: `${provider} API 키를 입력해주세요` });
      return;
    }

    setValidating(prev => ({ ...prev, [provider]: true }));
    setMessage({ type: 'info', text: `${provider} API 키를 검증하는 중...` });

    try {
      const result = await validateAPIKey(provider, key);

      setValidationResults(prev => ({ ...prev, [provider]: result }));

      if (result.valid) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.message });
      }

      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      setMessage({ type: 'error', text: `검증 실패: ${error.message}` });
      setValidationResults(prev => ({ ...prev, [provider]: { valid: false, message: error.message } }));
    } finally {
      setValidating(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleDelete = (provider) => {
    if (window.confirm(`${provider} API 키를 삭제하시겠습니까?`)) {
      try {
        removeAPIKey(provider);
        setSavedKeys(prev => ({
          ...prev,
          [provider]: null
        }));
        setValidationResults(prev => ({ ...prev, [provider]: null }));
        setMessage({ type: 'success', text: `${provider} API 키가 삭제되었습니다` });

        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: `삭제 실패: ${error.message}` });
      }
    }
  };

  return (
    <div className="api-key-form">
      <div className="form-header">
        <h2>API 키 관리</h2>
        <p className="form-description">
          AI 세무 분석을 위한 API 키를 안전하게 저장하고 관리합니다
        </p>
      </div>

      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {API_PROVIDERS.map(provider => (
        <div key={provider.id} className="api-key-section">
          <div className="section-header">
            <h3>{provider.name}</h3>
            <p className="section-description">{provider.description}</p>
          </div>

          {savedKeys[provider.id] ? (
            <div className="saved-key-display">
              <div className="key-info">
                <span className="key-icon">🔑</span>
                <span className="key-value">
                  {maskAPIKey(savedKeys[provider.id])}
                </span>
                <span className="key-status">✅ 저장됨</span>
              </div>
              <button
                className="btn btn-danger-outline"
                onClick={() => handleDelete(provider.id)}
              >
                삭제
              </button>
            </div>
          ) : (
            <div className="key-input-group">
              <div className="input-wrapper">
                <input
                  type={showKeys[provider.id] ? 'text' : 'password'}
                  className="key-input"
                  placeholder={provider.placeholder}
                  value={apiKeys[provider.id]}
                  onChange={(e) => handleInputChange(provider.id, e.target.value)}
                  maxLength={200}
                />
                <button
                  type="button"
                  className="toggle-visibility-btn"
                  onClick={() => toggleShowKey(provider.id)}
                  title={showKeys[provider.id] ? '숨기기' : '보기'}
                >
                  {showKeys[provider.id] ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <div className="button-group">
                <button
                  className="btn btn-validate"
                  onClick={() => handleValidate(provider.id)}
                  disabled={!apiKeys[provider.id] || validating[provider.id]}
                >
                  {validating[provider.id] ? '검증 중...' : '키 검증'}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleSave(provider.id)}
                  disabled={!apiKeys[provider.id]}
                >
                  저장
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleInputChange(provider.id, '')}
                  disabled={!apiKeys[provider.id]}
                >
                  취소
                </button>
              </div>
              {validationResults[provider.id] && (
                <div className={`validation-result ${validationResults[provider.id].valid ? 'valid' : 'invalid'}`}>
                  {validationResults[provider.id].valid ? '✅' : '❌'} {validationResults[provider.id].message}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <div className="security-notice">
        <h4>🔒 보안 정보</h4>
        <ul>
          <li>API 키는 AES-256 암호화로 브라우저 localStorage에 안전하게 저장됩니다</li>
          <li>서버로 전송되지 않으며, 브라우저에서만 사용됩니다</li>
          <li>브라우저 지문 기반 고유 암호화 키가 사용됩니다</li>
          <li>다른 기기에서는 API 키를 다시 입력해야 합니다</li>
        </ul>
      </div>
    </div>
  );
};

export default APIKeyForm;

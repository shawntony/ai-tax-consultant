/**
 * Case Input Component (Step 1)
 * 사용자가 세무 상담 사례를 자유롭게 입력하는 컴포넌트
 *
 * PRD Section 5.1.1 구현
 *
 * @version 1.0.0
 * @date 2025-10-20
 */

import React, { useState, useEffect } from 'react';
import './CaseInput.css';

const CaseInput = ({ initialDescription = '', initialAI = 'claude', onSubmit, onNext }) => {
  // ==========================================
  // State Management
  // ==========================================

  const [description, setDescription] = useState(initialDescription);
  const [selectedAI, setSelectedAI] = useState(initialAI);
  const [charCount, setCharCount] = useState(initialDescription.length);
  const [error, setError] = useState('');
  const [showExamples, setShowExamples] = useState(false);

  // AI 옵션 정의
  const aiOptions = [
    {
      id: 'claude',
      name: 'Claude (Anthropic)',
      description: '복잡한 세무 분석에 최적',
      icon: '🧠',
      recommended: true,
      features: ['상세한 법률 분석', '다양한 시나리오 제시', '정확한 세법 해석']
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT (OpenAI)',
      description: '일반적인 세무 상담에 적합',
      icon: '💬',
      recommended: false,
      features: ['빠른 응답', '이해하기 쉬운 설명', '실용적인 조언']
    },
    {
      id: 'perplexity',
      name: 'Perplexity AI',
      description: '최신 세법 확인 및 검색',
      icon: '🔍',
      recommended: false,
      features: ['최신 세법 정보', '판례 검색', '실시간 데이터']
    }
  ];

  // 예시 사례들
  const exampleCases = [
    {
      title: '부동산 상속',
      description: `부친께서 5억원 상당의 아파트와 3억원의 현금을 보유하고 계십니다.
상속인은 배우자(모친)와 자녀 2명(본인 포함)입니다.
상속세를 어떻게 계산하는지, 절세 방법은 무엇인지 궁금합니다.`
    },
    {
      title: '주식 증여',
      description: `부모님이 보유하신 비상장 법인 주식(평가액 10억원)을
자녀인 저에게 증여하려고 합니다.
증여세는 얼마나 나올까요? 분할 증여가 유리한가요?`
    },
    {
      title: '부동산 양도',
      description: `서울 강남구 아파트를 2018년에 5억원에 구입했고,
현재 시세는 12억원입니다. 2주택자이며 조정대상지역입니다.
양도소득세가 얼마나 나오고, 어떻게 절세할 수 있을까요?`
    }
  ];

  // ==========================================
  // Event Handlers
  // ==========================================

  useEffect(() => {
    setCharCount(description.length);
  }, [description]);

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= 10000) {
      setDescription(value);
      setError('');
    }
  };

  const handleAISelect = (aiId) => {
    setSelectedAI(aiId);
  };

  const handleLoadExample = (example) => {
    setDescription(example.description);
    setShowExamples(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 검증
    if (!description.trim()) {
      setError('사례를 입력해주세요');
      return;
    }

    if (description.trim().length < 50) {
      setError('최소 50자 이상 입력해주세요 (현재: ' + description.trim().length + '자)');
      return;
    }

    // 부모 컴포넌트에 전달
    if (onSubmit) {
      onSubmit(description, selectedAI);
    }

    // 다음 단계로
    if (onNext) {
      onNext();
    }
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="case-input">
      <div className="case-input-header">
        <h2>📋 Step 1: 사례 입력</h2>
        <p className="step-description">
          세무 상담이 필요한 상황을 자유롭게 설명해주세요.
          <br />
          AI가 상황을 분석하고 필요한 정보를 요청할 것입니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="case-input-form">
        {/* 사례 입력 영역 */}
        <div className="form-section">
          <label htmlFor="caseDescription" className="form-label">
            상담 사례 <span className="required">*</span>
          </label>

          <div className="textarea-wrapper">
            <textarea
              id="caseDescription"
              value={description}
              onChange={handleDescriptionChange}
              placeholder={`예시:
부친께서 보유하신 강남 아파트(시가 10억원)를 상속받게 될 예정입니다.
상속인은 배우자와 자녀 2명이며, 부채는 1억원 정도 있습니다.
상속세가 얼마나 나올지, 어떻게 절세할 수 있을지 알고 싶습니다.

* 재산 종류 및 가액
* 상속인 관계 및 인원
* 부채 여부
* 궁금한 사항

등을 자유롭게 작성해주세요.`}
              className={`case-textarea ${error ? 'error' : ''}`}
              rows={12}
            />

            {/* 글자 수 표시 */}
            <div className="char-counter">
              <span className={charCount < 50 ? 'warning' : charCount > 9500 ? 'warning' : ''}>
                {charCount.toLocaleString()}
              </span>
              <span className="char-limit"> / 10,000자</span>
              {charCount < 50 && (
                <span className="char-hint"> (최소 50자)</span>
              )}
            </div>
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {/* 도움말 버튼 */}
          <div className="input-helpers">
            <button
              type="button"
              onClick={() => setShowExamples(!showExamples)}
              className="btn-helper"
            >
              📖 {showExamples ? '예시 닫기' : '예시 보기'}
            </button>
            <span className="helper-hint">
              💡 어떻게 작성해야 할지 모르겠다면 예시를 참고하세요
            </span>
          </div>

          {/* 예시 목록 */}
          {showExamples && (
            <div className="examples-list">
              <h4>📝 사례 예시</h4>
              {exampleCases.map((example, index) => (
                <div key={index} className="example-card">
                  <div className="example-header">
                    <h5>{example.title}</h5>
                    <button
                      type="button"
                      onClick={() => handleLoadExample(example)}
                      className="btn-load-example"
                    >
                      불러오기
                    </button>
                  </div>
                  <p className="example-text">{example.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI 선택 영역 */}
        <div className="form-section">
          <label className="form-label">
            AI 도구 선택 <span className="required">*</span>
          </label>
          <p className="form-hint">
            각 AI의 특징을 고려하여 선택하세요
          </p>

          <div className="ai-options">
            {aiOptions.map((ai) => (
              <div
                key={ai.id}
                className={`ai-option ${selectedAI === ai.id ? 'selected' : ''} ${ai.recommended ? 'recommended' : ''}`}
                onClick={() => handleAISelect(ai.id)}
              >
                {ai.recommended && (
                  <div className="recommended-badge">추천</div>
                )}
                <div className="ai-icon">{ai.icon}</div>
                <div className="ai-info">
                  <h4>{ai.name}</h4>
                  <p className="ai-description">{ai.description}</p>
                  <ul className="ai-features">
                    {ai.features.map((feature, index) => (
                      <li key={index}>✓ {feature}</li>
                    ))}
                  </ul>
                </div>
                <div className="ai-selector">
                  <input
                    type="radio"
                    name="ai"
                    value={ai.id}
                    checked={selectedAI === ai.id}
                    onChange={() => handleAISelect(ai.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={!description.trim() || description.trim().length < 50}
          >
            다음 단계로 → (AI 분석 시작)
          </button>
        </div>
      </form>

      {/* 안내 사항 */}
      <div className="case-input-footer">
        <div className="info-box">
          <h4>📌 작성 가이드</h4>
          <ul>
            <li><strong>재산 정보:</strong> 부동산, 현금, 주식 등의 종류와 대략적인 가액</li>
            <li><strong>관계 정보:</strong> 상속인/증여자/수증자의 관계 및 인원</li>
            <li><strong>특이사항:</strong> 부채, 기존 증여 이력, 거주 여부 등</li>
            <li><strong>궁금한 점:</strong> 예상 세금, 절세 방법, 주의사항 등</li>
          </ul>
          <p className="info-note">
            💡 자세하게 작성할수록 AI가 더 정확한 분석을 제공합니다
          </p>
        </div>
      </div>
    </div>
  );
};

export default CaseInput;

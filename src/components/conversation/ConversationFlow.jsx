/**
 * Conversation Flow Component
 * 대화형 질문-답변 수집 컴포넌트
 *
 * @version 1.0.0
 * @date 2025-10-21
 */

import React, { useState, useEffect } from 'react';
import {
  giftInheritanceQuestions,
  questionCategoryOrder,
  categoryMetadata,
  shouldShowQuestion,
  calculateCompleteness,
  formatAnswersForAI
} from '../../data/questionTemplates';
import './ConversationFlow.css';

export default function ConversationFlow({ onComplete, initialAnswers = {} }) {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [completeness, setCompleteness] = useState({ completeness: 0, missing: [] });

  const currentCategoryKey = questionCategoryOrder[currentCategoryIndex];
  const currentCategory = giftInheritanceQuestions[currentCategoryKey];
  const metadata = categoryMetadata[currentCategoryKey];
  const totalCategories = questionCategoryOrder.length;
  const progress = ((currentCategoryIndex + 1) / totalCategories) * 100;

  // 완성도 계산
  useEffect(() => {
    const result = calculateCompleteness(answers);
    setCompleteness(result);
  }, [answers]);

  // 답변 업데이트
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // 다음 카테고리로
  const handleNext = () => {
    if (currentCategoryIndex < totalCategories - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
    } else {
      // 마지막 카테고리 - 완료
      handleComplete();
    }
  };

  // 이전 카테고리로
  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
    }
  };

  // 완료 처리
  const handleComplete = () => {
    const formattedAnswers = formatAnswersForAI(answers);
    onComplete({
      rawAnswers: answers,
      formattedText: formattedAnswers,
      completeness: completeness.completeness
    });
  };

  // 질문 렌더링
  const renderQuestion = (question) => {
    if (!shouldShowQuestion(question, answers)) {
      return null;
    }

    const value = answers[question.id] || '';

    return (
      <div key={question.id} className="question-item">
        <label className="question-label">
          {question.question}
          {question.required && <span className="required-mark">*</span>}
        </label>

        {question.helpText && (
          <p className="question-help">{question.helpText}</p>
        )}

        {renderInput(question, value)}

        {/* 하위 질문 렌더링 */}
        {question.subQuestions && shouldShowQuestion(question, answers) && (
          <div className="sub-questions">
            {question.subQuestions.map(renderQuestion)}
          </div>
        )}
      </div>
    );
  };

  // 입력 필드 렌더링
  const renderInput = (question, value) => {
    switch (question.type) {
      case 'radio':
        return (
          <div className="radio-group">
            {question.options.map(option => (
              <label key={option.value} className="radio-option">
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                />
                <span className="radio-label">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'select':
        return (
          <select
            className="select-input"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          >
            <option value="">선택해주세요</option>
            {question.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="checkbox-group">
            {question.options.map(option => (
              <label key={option.value} className="checkbox-option">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={(value || []).includes(option.value)}
                  onChange={(e) => {
                    const currentValues = value || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    handleAnswerChange(question.id, newValues);
                  }}
                />
                <span className="checkbox-label">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'currency':
        return (
          <div className="currency-input-wrapper">
            <input
              type="number"
              className="currency-input"
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={question.placeholder || '금액을 입력하세요'}
              step="10000000"
            />
            <span className="currency-unit">원</span>
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            className="number-input"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            className="date-input"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        );

      case 'text':
      default:
        return question.multiline ? (
          <textarea
            className="text-input multiline"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={4}
          />
        ) : (
          <input
            type="text"
            className="text-input"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder}
          />
        );
    }
  };

  // 현재 카테고리의 필수 답변 체크
  const isCurrentCategoryComplete = () => {
    const categoryQuestions = currentCategory.questions;

    for (const question of categoryQuestions) {
      if (!shouldShowQuestion(question, answers)) continue;

      if (question.required && !answers[question.id]) {
        return false;
      }

      // 하위 질문도 체크
      if (question.subQuestions && shouldShowQuestion(question, answers)) {
        for (const subQ of question.subQuestions) {
          if (subQ.required && !answers[subQ.id]) {
            return false;
          }
        }
      }
    }

    return true;
  };

  const canProceed = currentCategory.required ? isCurrentCategoryComplete() : true;

  return (
    <div className="conversation-flow">
      {/* 프로그레스 바 */}
      <div className="progress-section">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-info">
          <span className="progress-text">
            {currentCategoryIndex + 1} / {totalCategories}
          </span>
          <span className="completeness-text">
            전체 완성도: {completeness.completeness.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* 카테고리 헤더 */}
      <div className="category-header">
        <div className="category-icon">{metadata.icon}</div>
        <div className="category-info">
          <h2 className="category-title">{metadata.title}</h2>
          <p className="category-description">{metadata.description}</p>
          <span className="estimated-time">예상 소요 시간: {metadata.estimatedTime}</span>
        </div>
      </div>

      {/* 질문 목록 */}
      <div className="questions-container">
        {currentCategory.questions.map(renderQuestion)}
      </div>

      {/* 네비게이션 버튼 */}
      <div className="navigation-buttons">
        <button
          className="btn-nav btn-previous"
          onClick={handlePrevious}
          disabled={currentCategoryIndex === 0}
        >
          ← 이전
        </button>

        <div className="nav-spacer"></div>

        {currentCategoryIndex < totalCategories - 1 ? (
          <button
            className="btn-nav btn-next"
            onClick={handleNext}
            disabled={!canProceed}
          >
            다음 →
          </button>
        ) : (
          <button
            className="btn-nav btn-complete"
            onClick={handleComplete}
            disabled={completeness.completeness < 70}
          >
            ✓ 정보 수집 완료
          </button>
        )}
      </div>

      {/* 진행 상태 안내 */}
      {!canProceed && currentCategory.required && (
        <div className="validation-message">
          <span className="validation-icon">⚠️</span>
          <span>필수 항목을 모두 입력해주세요</span>
        </div>
      )}

      {currentCategoryIndex === totalCategories - 1 && completeness.completeness < 70 && (
        <div className="validation-message warning">
          <span className="validation-icon">💡</span>
          <span>
            정확한 전략 수립을 위해 완성도 70% 이상을 권장합니다
            (현재: {completeness.completeness.toFixed(0)}%)
          </span>
        </div>
      )}
    </div>
  );
}

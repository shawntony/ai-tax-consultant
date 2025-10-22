/**
 * Action Plan Component
 * 타임라인 기반 실행 계획 시각화
 *
 * @version 1.0.0
 * @date 2025-10-22
 */

import React, { useState } from 'react';
import './ActionPlan.css';

export default function ActionPlan({ actionPlan, recommendedScenario }) {
  const [expandedStep, setExpandedStep] = useState(null);

  if (!actionPlan || actionPlan.length === 0) {
    return (
      <div className="action-plan empty">
        <p>실행 계획이 없습니다.</p>
      </div>
    );
  }

  const toggleStep = (stepNumber) => {
    setExpandedStep(expandedStep === stepNumber ? null : stepNumber);
  };

  // 전체 소요 기간 계산
  const calculateTotalDuration = () => {
    const durations = actionPlan
      .map((step) => step.duration)
      .filter(Boolean);

    if (durations.length === 0) return '미정';

    // 간단한 문자열 합산 (예: "1개월" + "2주" = "1개월 2주")
    return durations.join(' + ');
  };

  // 단계별 진행률 계산 (데모용)
  const getProgressPercentage = (stepNumber, totalSteps) => {
    return (stepNumber / totalSteps) * 100;
  };

  return (
    <div className="action-plan">
      <div className="plan-header">
        <h2>📋 실행 계획</h2>
        {recommendedScenario && (
          <div className="recommended-scenario-banner">
            <span className="banner-icon">✨</span>
            <span className="banner-text">추천 전략: {recommendedScenario}</span>
          </div>
        )}
        <div className="plan-summary">
          <div className="summary-item">
            <span className="summary-label">총 단계:</span>
            <span className="summary-value">{actionPlan.length}단계</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">예상 소요 기간:</span>
            <span className="summary-value">{calculateTotalDuration()}</span>
          </div>
        </div>
      </div>

      <div className="timeline">
        {actionPlan.map((step, index) => {
          const isExpanded = expandedStep === step.step;
          const isLastStep = index === actionPlan.length - 1;
          const progressPercentage = getProgressPercentage(step.step, actionPlan.length);

          return (
            <div key={step.step} className={`timeline-item ${isExpanded ? 'expanded' : ''}`}>
              {/* 타임라인 라인 */}
              {!isLastStep && <div className="timeline-line"></div>}

              {/* 타임라인 마커 */}
              <div className="timeline-marker">
                <div className="marker-outer">
                  <div className="marker-inner">{step.step}</div>
                </div>
                <div className="marker-progress" style={{ width: `${progressPercentage}%` }}></div>
              </div>

              {/* 타임라인 콘텐츠 */}
              <div className="timeline-content">
                <div className="step-header" onClick={() => toggleStep(step.step)}>
                  <div className="step-title-section">
                    <h3 className="step-title">{step.title}</h3>
                    <div className="step-meta">
                      <span className="step-duration">
                        <span className="meta-icon">⏱️</span>
                        {step.duration || '미정'}
                      </span>
                      {step.estimatedCost && (
                        <span className="step-cost">
                          <span className="meta-icon">💰</span>
                          {step.estimatedCost}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="expand-button">
                    {isExpanded ? '▼' : '▶'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="step-details">
                    {/* 설명 */}
                    {step.description && (
                      <div className="detail-section">
                        <h4>📝 상세 설명</h4>
                        <p className="description-text">{step.description}</p>
                      </div>
                    )}

                    {/* 필요 서류 */}
                    {step.requiredDocuments && step.requiredDocuments.length > 0 && (
                      <div className="detail-section">
                        <h4>📄 필요 서류</h4>
                        <ul className="document-list">
                          {step.requiredDocuments.map((doc, idx) => (
                            <li key={idx}>
                              <span className="doc-icon">📎</span>
                              <span className="doc-name">{doc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 주의사항 */}
                    {step.cautions && step.cautions.length > 0 && (
                      <div className="detail-section">
                        <h4>⚠️ 주의사항</h4>
                        <ul className="caution-list">
                          {step.cautions.map((caution, idx) => (
                            <li key={idx}>{caution}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 체크리스트 */}
                    {step.checklist && step.checklist.length > 0 && (
                      <div className="detail-section">
                        <h4>✓ 체크리스트</h4>
                        <ul className="checklist">
                          {step.checklist.map((item, idx) => (
                            <li key={idx}>
                              <input type="checkbox" id={`check-${step.step}-${idx}`} />
                              <label htmlFor={`check-${step.step}-${idx}`}>{item}</label>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 예상 비용 상세 */}
                    {step.costBreakdown && (
                      <div className="detail-section">
                        <h4>💰 비용 상세</h4>
                        <div className="cost-breakdown">
                          {Object.entries(step.costBreakdown).map(([key, value]) => (
                            <div key={key} className="cost-item">
                              <span className="cost-label">{key}:</span>
                              <span className="cost-value">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 전체 주의사항 */}
      <div className="plan-footer">
        <div className="general-notes">
          <h3>🔔 전체 주의사항</h3>
          <ul>
            <li>각 단계는 순차적으로 진행되어야 하며, 이전 단계 완료 후 다음 단계로 넘어가세요.</li>
            <li>필요 서류는 사전에 준비하여 진행 시간을 단축할 수 있습니다.</li>
            <li>세법 개정이나 개인 상황 변화 시 전문가와 재상담이 필요합니다.</li>
            <li>모든 비용은 예상치이며, 실제 비용은 상황에 따라 변동될 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Step Indicator Component
 * 워크플로우 진행 단계 표시
 *
 * @version 1.0.0
 * @date 2025-10-20
 */

import React from 'react';
import './StepIndicator.css';

const StepIndicator = ({ currentStep, onStepClick, completedSteps = [] }) => {
  const steps = [
    {
      number: 1,
      title: '사례 입력',
      icon: '📋'
    },
    {
      number: 2,
      title: 'AI 분석',
      icon: '🧠'
    },
    {
      number: 3,
      title: '수치 입력',
      icon: '🔢'
    },
    {
      number: 4,
      title: '시나리오 비교',
      icon: '📊'
    }
  ];

  const getStepStatus = (stepNumber) => {
    if (stepNumber === currentStep) return 'current';
    if (completedSteps.includes(stepNumber)) return 'completed';
    return 'pending';
  };

  const handleStepClick = (stepNumber) => {
    // 완료된 단계나 현재 단계로만 이동 가능
    if (completedSteps.includes(stepNumber) || stepNumber === currentStep) {
      onStepClick(stepNumber);
    }
  };

  return (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          {/* Step */}
          <div
            className={`step ${getStepStatus(step.number)} ${
              (completedSteps.includes(step.number) || step.number === currentStep) ? 'clickable' : ''
            }`}
            onClick={() => handleStepClick(step.number)}
          >
            <div className="step-circle">
              {completedSteps.includes(step.number) ? (
                <span className="step-check">✓</span>
              ) : (
                <span className="step-icon">{step.icon}</span>
              )}
            </div>
            <div className="step-label">
              <div className="step-number">Step {step.number}</div>
              <div className="step-title">{step.title}</div>
            </div>
          </div>

          {/* Connector */}
          {index < steps.length - 1 && (
            <div className={`step-connector ${
              completedSteps.includes(step.number) ? 'completed' : ''
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;

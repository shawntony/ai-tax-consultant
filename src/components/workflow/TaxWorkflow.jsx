/**
 * Tax Workflow Main Component
 * AI 기반 4단계 세무 컨설팅 워크플로우
 *
 * PRD Section 5.1 구현
 *
 * @version 1.0.0
 * @date 2025-10-20
 */

import React, { useState, useEffect } from 'react';
import StepIndicator from './StepIndicator';
import CaseInput from './CaseInput';
import AIAnalysis from './AIAnalysis';
import DynamicNumericalInput from './DynamicNumericalInput';
import WorkflowScenarioComparison from './WorkflowScenarioComparison';
import './TaxWorkflow.css';

const TaxWorkflow = () => {
  // ==========================================
  // State Management
  // ==========================================

  // 현재 단계 (1-4)
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: 사례 입력
  const [caseDescription, setCaseDescription] = useState('');
  const [selectedAI, setSelectedAI] = useState('claude'); // claude | chatgpt | perplexity

  // Step 2: AI 분석 결과
  const [aiAnalysis, setAIAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // Step 3: 동적 수치 입력
  const [numericalInputs, setNumericalInputs] = useState({});
  const [calculationResult, setCalculationResult] = useState(null);

  // Step 4: 시나리오 관리
  const [scenarios, setScenarios] = useState([]);
  const [currentScenario, setCurrentScenario] = useState(null);

  // 자동 저장 (localStorage)
  useEffect(() => {
    const savedData = localStorage.getItem('taxWorkflowData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.caseDescription) setCaseDescription(parsed.caseDescription);
        if (parsed.selectedAI) setSelectedAI(parsed.selectedAI);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        if (parsed.aiAnalysis) setAIAnalysis(parsed.aiAnalysis);
        if (parsed.numericalInputs) setNumericalInputs(parsed.numericalInputs);
        if (parsed.scenarios) setScenarios(parsed.scenarios);
      } catch (error) {
        console.error('Failed to restore workflow data:', error);
      }
    }
  }, []);

  // 자동 저장 (30초마다)
  useEffect(() => {
    const saveInterval = setInterval(() => {
      const dataToSave = {
        currentStep,
        caseDescription,
        selectedAI,
        aiAnalysis,
        numericalInputs,
        scenarios,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('taxWorkflowData', JSON.stringify(dataToSave));
    }, 30000); // 30초

    return () => clearInterval(saveInterval);
  }, [currentStep, caseDescription, selectedAI, aiAnalysis, numericalInputs, scenarios]);

  // ==========================================
  // Navigation Handlers
  // ==========================================

  const goToStep = (step) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextStep = () => {
    if (currentStep < 4) {
      goToStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  // ==========================================
  // Step 1 Handlers
  // ==========================================

  const handleCaseSubmit = (description, aiProvider) => {
    setCaseDescription(description);
    setSelectedAI(aiProvider);
    nextStep();
  };

  // ==========================================
  // Step 2 Handlers
  // ==========================================

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
  };

  const handleAnalysisComplete = (result) => {
    setAIAnalysis(result);
    setIsAnalyzing(false);
    setAnalysisError(null);

    // 자동으로 다음 단계로 이동하지 않음
    // 사용자가 분석 결과를 확인한 후 수동으로 진행
  };

  const handleAnalysisError = (error) => {
    setIsAnalyzing(false);
    setAnalysisError(error);
  };

  const handleAnalysisRetry = () => {
    setAnalysisError(null);
    // AIAnalysis 컴포넌트가 자동으로 재시도
  };

  // ==========================================
  // Step 3 Handlers
  // ==========================================

  const handleNumericalInputChange = (inputs) => {
    setNumericalInputs(inputs);
  };

  const handleCalculationComplete = (result) => {
    setCalculationResult(result);

    // 첫 번째 시나리오 자동 생성
    if (scenarios.length === 0) {
      const firstScenario = {
        id: `scenario-${Date.now()}`,
        name: '시나리오 1',
        inputs: numericalInputs,
        result: result,
        createdAt: new Date().toISOString()
      };
      setScenarios([firstScenario]);
      setCurrentScenario(firstScenario);
    }
  };

  // ==========================================
  // Step 4 Handlers
  // ==========================================

  const handleAddScenario = (newScenario) => {
    setScenarios([...scenarios, newScenario]);
  };

  const handleUpdateScenario = (scenarioId, updatedScenario) => {
    setScenarios(scenarios.map(s =>
      s.id === scenarioId ? updatedScenario : s
    ));
  };

  const handleDeleteScenario = (scenarioId) => {
    setScenarios(scenarios.filter(s => s.id !== scenarioId));
  };

  const handleExportJSON = () => {
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      case: {
        description: caseDescription,
        ai: selectedAI,
        analysisDate: aiAnalysis?.timestamp || new Date().toISOString()
      },
      taxData: aiAnalysis,
      scenarios: scenarios,
      metadata: {
        appVersion: '1.0.0',
        browser: navigator.userAgent
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `세무컨설팅_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // Utility Functions
  // ==========================================

  const resetWorkflow = () => {
    if (window.confirm('모든 입력 내용이 삭제됩니다. 계속하시겠습니까?')) {
      setCurrentStep(1);
      setCaseDescription('');
      setSelectedAI('claude');
      setAIAnalysis(null);
      setNumericalInputs({});
      setCalculationResult(null);
      setScenarios([]);
      setCurrentScenario(null);
      setIsAnalyzing(false);
      setAnalysisError(null);
      localStorage.removeItem('taxWorkflowData');
    }
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="tax-workflow">
      {/* 헤더 */}
      <div className="workflow-header">
        <h1>🤖 AI 세무 컨설턴트</h1>
        <p className="subtitle">인공지능이 분석하는 맞춤형 세무 상담</p>
        <button
          onClick={resetWorkflow}
          className="btn-reset"
          title="처음부터 다시 시작"
        >
          🔄 초기화
        </button>
      </div>

      {/* 단계 표시 */}
      <StepIndicator
        currentStep={currentStep}
        onStepClick={goToStep}
        completedSteps={
          currentStep > 1 ? [1] : []
        }
      />

      {/* 단계별 컴포넌트 */}
      <div className="workflow-content">
        {currentStep === 1 && (
          <CaseInput
            initialDescription={caseDescription}
            initialAI={selectedAI}
            onSubmit={handleCaseSubmit}
            onNext={nextStep}
          />
        )}

        {currentStep === 2 && (
          <AIAnalysis
            caseDescription={caseDescription}
            selectedAI={selectedAI}
            isAnalyzing={isAnalyzing}
            analysisResult={aiAnalysis}
            analysisError={analysisError}
            onAnalysisStart={handleAnalysisStart}
            onAnalysisComplete={handleAnalysisComplete}
            onAnalysisError={handleAnalysisError}
            onRetry={handleAnalysisRetry}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}

        {currentStep === 3 && (
          <DynamicNumericalInput
            aiAnalysis={aiAnalysis}
            initialInputs={numericalInputs}
            onInputChange={handleNumericalInputChange}
            onCalculationComplete={handleCalculationComplete}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}

        {currentStep === 4 && (
          <WorkflowScenarioComparison
            scenarios={scenarios}
            currentScenario={currentScenario}
            aiAnalysis={aiAnalysis}
            onAddScenario={handleAddScenario}
            onUpdateScenario={handleUpdateScenario}
            onDeleteScenario={handleDeleteScenario}
            onExportJSON={handleExportJSON}
            onPrev={prevStep}
            onBackToStep3={() => goToStep(3)}
          />
        )}
      </div>

      {/* 진행 상황 저장 안내 */}
      <div className="workflow-footer">
        <p className="auto-save-notice">
          💾 진행 상황이 자동으로 저장됩니다
        </p>
      </div>
    </div>
  );
};

export default TaxWorkflow;

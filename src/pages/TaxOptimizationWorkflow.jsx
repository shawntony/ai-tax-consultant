/**
 * Tax Optimization Workflow v2 - Improved UX
 * 사이드바 방식으로 케이스 입력과 노드 편집을 통합
 *
 * @version 2.0.0
 * @date 2025-10-21
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SimpleNodeFlow from '../components/workflow/SimpleNodeFlow';
import ConversationFlow from '../components/conversation/ConversationFlow';
import StrategyComparison from '../components/strategy/StrategyComparison';
import DecisionTree from '../components/strategy/DecisionTree';
import ActionPlan from '../components/strategy/ActionPlan';
import TaxSimulator from '../components/tax/TaxSimulator';
import './TaxOptimizationWorkflow.css';

export default function TaxOptimizationWorkflow() {
  const [caseDescription, setCaseDescription] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [workflowStep, setWorkflowStep] = useState('initial'); // 'initial', 'conversation', 'analysis', 'nodes'
  const [collectedInfo, setCollectedInfo] = useState(null);
  const [activeVisualization, setActiveVisualization] = useState('nodes'); // 'nodes', 'comparison', 'tree', 'plan', 'simulator'

  const handleAnalyze = async () => {
    if (!caseDescription.trim()) {
      alert('케이스 설명을 입력해주세요');
      return;
    }

    // 대화형 정보 수집 단계로 전환
    setWorkflowStep('conversation');
  };

  const handleConversationComplete = async (data) => {
    setCollectedInfo(data);
    setWorkflowStep('analysis');
    setIsAnalyzing(true);

    try {
      // Backend API 호출하여 전략 생성
      const response = await fetch('http://localhost:3001/api/generate-strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          collectedInfo: data
        })
      });

      if (!response.ok) {
        throw new Error('전략 생성 실패');
      }

      const result = await response.json();

      if (result.success) {
        // 전략 데이터 저장
        setCollectedInfo(prev => ({
          ...prev,
          strategy: result.strategy
        }));

        setIsAnalyzing(false);
        setWorkflowStep('nodes');
      } else {
        throw new Error(result.error || '전략 생성 중 오류 발생');
      }
    } catch (error) {
      console.error('Strategy generation error:', error);
      setIsAnalyzing(false);
      alert(`전략 생성 실패: ${error.message}\n\n임시로 샘플 전략을 표시합니다.`);

      // 에러 발생 시 샘플 전략 데이터
      setCollectedInfo(prev => ({
        ...prev,
        strategy: {
          scenarios: [
            {
              name: '순수 증여 전략',
              description: '채무 없이 순수하게 증여하는 기본 전략',
              taxCalculation: {
                giftTax: 200000000,
                capitalGainsTax: 0,
                acquisitionTax: 30000000,
                totalTax: 230000000
              },
              pros: ['절차가 간단함', '양도소득세 없음', '즉시 완료 가능'],
              cons: ['증여세 부담이 큼', '절세 효과 제한적'],
              risks: ['고액 증여세 납부 부담', '증여 후 5년 내 처분 시 불이익'],
              timeframe: '1-2개월',
              complexity: 'low'
            },
            {
              name: '부담부 증여 (30% 채무)',
              description: '30% 채무를 승계하여 증여세를 절감하는 전략',
              taxCalculation: {
                giftTax: 100000000,
                capitalGainsTax: 20000000,
                acquisitionTax: 21000000,
                totalTax: 141000000
              },
              pros: ['증여세 대폭 절감', '총 세금 부담 감소'],
              cons: ['양도소득세 발생', '절차가 복잡함'],
              risks: ['세무 조사 가능성', '부채 승계 부담'],
              timeframe: '2-3개월',
              complexity: 'medium'
            },
            {
              name: '상속 대기 전략',
              description: '증여 대신 상속을 기다리는 전략',
              taxCalculation: {
                giftTax: 0,
                inheritanceTax: 150000000,
                capitalGainsTax: 0,
                acquisitionTax: 0,
                totalTax: 150000000
              },
              pros: ['상속공제 활용 가능', '배우자 공제 최대화'],
              cons: ['불확실성 높음', '즉시 실행 불가'],
              risks: ['상속 시점 불확실', '세율 변동 가능성'],
              timeframe: '시점 불확실',
              complexity: 'low'
            }
          ],
          recommendedScenario: '부담부 증여 (30% 채무)',
          reasoning: '총 세금 부담이 가장 낮고(1.41억원), 즉시 실행 가능하며, 절세 효과가 크기 때문에 추천합니다.',
          actionPlan: [
            {
              step: 1,
              title: '부동산 감정평가',
              description: '공인 감정평가사를 통해 부동산의 시가를 정확하게 평가받습니다.',
              duration: '1-2주',
              requiredDocuments: ['등기부등본', '건축물대장', '토지대장'],
              estimatedCost: '300,000원 - 500,000원',
              cautions: ['공신력 있는 감정평가 기관 선택', '평가 시점 고려'],
              checklist: ['감정평가 기관 선정', '필요 서류 준비', '평가 신청', '평가서 수령'],
              costBreakdown: {
                '감정평가 수수료': '300,000원 - 500,000원'
              }
            },
            {
              step: 2,
              title: '채무 설정 및 대출 실행',
              description: '증여할 부동산에 담보대출을 설정하고 실행합니다.',
              duration: '2-3주',
              requiredDocuments: ['감정평가서', '소득증빙서류', '신용정보 동의서'],
              estimatedCost: '대출 관련 수수료',
              cautions: ['대출 한도 및 금리 협상', '중도상환 수수료 확인'],
              checklist: ['금융기관 선정', '대출 신청', '대출 승인', '대출 실행'],
              costBreakdown: {
                '인지세': '150,000원',
                '근저당 설정비': '100,000원',
                '기타 수수료': '50,000원'
              }
            },
            {
              step: 3,
              title: '증여계약 체결',
              description: '수증자와 증여계약서를 작성하고 공증을 받습니다.',
              duration: '1주',
              requiredDocuments: ['증여계약서', '감정평가서', '신분증'],
              estimatedCost: '공증 수수료',
              cautions: ['계약서 내용 정확히 기재', '채무 승계 조항 명확히'],
              checklist: ['계약서 작성', '공증 예약', '공증 실행', '계약서 보관'],
              costBreakdown: {
                '공증 수수료': '100,000원 - 200,000원'
              }
            },
            {
              step: 4,
              title: '증여세 신고 및 납부',
              description: '증여일로부터 3개월 이내에 증여세를 신고하고 납부합니다.',
              duration: '1-2주',
              requiredDocuments: ['증여계약서', '감정평가서', '채무 증명서류'],
              estimatedCost: '증여세 납부액',
              cautions: ['신고 기한 엄수(3개월)', '신고세액공제 3% 적용'],
              checklist: ['증여세 계산', '신고서 작성', '세무서 제출', '세금 납부'],
              costBreakdown: {
                '증여세': '100,000,000원',
                '신고대리 수수료': '500,000원 - 1,000,000원'
              }
            },
            {
              step: 5,
              title: '소유권 이전 등기',
              description: '법무사를 통해 부동산 소유권 이전 등기를 진행합니다.',
              duration: '1-2주',
              requiredDocuments: ['증여계약서', '증여세 납부확인서', '등기권리증'],
              estimatedCost: '등기비용 + 취득세',
              cautions: ['증여세 납부 후 진행', '취득세 납부 기한(60일)'],
              checklist: ['법무사 선정', '등기 서류 준비', '등기 신청', '등기 완료'],
              costBreakdown: {
                '취득세': '21,000,000원',
                '등기 수수료': '500,000원 - 1,000,000원',
                '법무사 비용': '500,000원 - 1,000,000원'
              }
            }
          ],
          nodes: [
            {
              id: 'start',
              type: 'issue',
              label: '부동산 이전 필요',
              description: '고령 부모님 → 자녀 부동산 이전',
              taxImpact: '증여 vs 상속 선택 필요',
              dependencies: []
            },
            {
              id: 'analysis',
              type: 'solution',
              label: '전략 분석',
              description: '3가지 시나리오 비교',
              taxImpact: '최소 1.41억원',
              dependencies: ['start']
            },
            {
              id: 'optimal',
              type: 'solution',
              label: '부담부 증여 30%',
              description: '최적 전략 실행',
              taxImpact: '총 1.41억원',
              dependencies: ['analysis']
            }
          ]
        }
      }));

      setWorkflowStep('nodes');
    }
  };

  const exampleCases = [
    {
      title: '상속 아파트 양도',
      description: '상속받은 아파트를 매도할 예정입니다. 저는 무주택자이며, 아버지께서는 이 아파트만 보유하고 계십니다. 양도소득세를 최소화하고 싶습니다.'
    },
    {
      title: '다주택자 양도',
      description: '현재 2주택을 보유하고 있으며, 그 중 한 채를 매도하려고 합니다. 보유기간은 5년이며, 취득가액은 3억원, 매도예정가는 5억원입니다.'
    },
    {
      title: '증여 vs 상속',
      description: '고령의 부모님이 부동산을 자녀에게 이전하려고 합니다. 증여와 상속 중 어떤 것이 세금 측면에서 유리한지 비교하고 싶습니다.'
    }
  ];

  return (
    <div className="workflow-page-v2">
      {/* 상단 헤더 */}
      <header className="workflow-header-v2">
        <div className="header-left">
          <Link to="/" className="back-link-v2">
            ← 홈
          </Link>
          <div className="header-title">
            <h1>세무 최적화 워크플로우</h1>
            <p>AI 기반 노드 분석 및 자동 최적화</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn-icon-v2"
            onClick={() => setShowSidebar(!showSidebar)}
            title={showSidebar ? '사이드바 숨기기' : '사이드바 표시'}
          >
            {showSidebar ? '◀' : '▶'}
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="workflow-content-v2">
        {/* Step 1: 초기 케이스 입력 */}
        {workflowStep === 'initial' && (
          <>
            {/* 좌측 사이드바 - 케이스 입력 */}
            <aside className={`workflow-sidebar-v2 ${showSidebar ? 'visible' : 'hidden'}`}>
          <div className="sidebar-section">
            <div className="section-header">
              <h2>📝 케이스 설명</h2>
              <span className="section-badge">실시간 반영</span>
            </div>

            <textarea
              className="case-input-v2"
              value={caseDescription}
              onChange={(e) => setCaseDescription(e.target.value)}
              placeholder="세무 상황을 자세히 설명해주세요...

예시:
- 부동산 정보 (종류, 보유기간, 취득가액)
- 현재 상황 (주택 수, 거주 여부)
- 목표 (절세, 증여, 상속)
- 특이사항 (연령, 소득, 가족관계)"
              rows={12}
            />

            <button
              className="btn-analyze-v2"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !caseDescription.trim()}
            >
              {isAnalyzing ? (
                <>
                  <span className="spinner-v2"></span>
                  AI 분석 중...
                </>
              ) : (
                <>
                  <span className="icon-v2">🤖</span>
                  AI 노드 자동 생성
                </>
              )}
            </button>
          </div>

          {/* 예시 케이스 */}
          <div className="sidebar-section">
            <h3 className="section-title-small">💡 예시 케이스</h3>
            <div className="example-cases">
              {exampleCases.map((example, idx) => (
                <button
                  key={idx}
                  className="example-card"
                  onClick={() => setCaseDescription(example.description)}
                >
                  <div className="example-title">{example.title}</div>
                  <div className="example-desc">
                    {example.description.substring(0, 60)}...
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 빠른 팁 */}
          <div className="sidebar-section tips-section">
            <h3 className="section-title-small">💡 작성 팁</h3>
            <ul className="tips-list">
              <li>구체적인 금액과 날짜를 포함하세요</li>
              <li>가족 관계와 현재 상황을 명확히 하세요</li>
              <li>최종 목표를 명시하세요 (절세, 증여, 상속 등)</li>
              <li>케이스를 수정하면 노드를 다시 생성할 수 있습니다</li>
            </ul>
          </div>
        </aside>

        {/* 중앙 노드 편집 영역 */}
        <main className="workflow-main-v2">
          <div className="workflow-toolbar-v2">
            <div className="toolbar-left">
              <span className="toolbar-title">노드 편집</span>
              <span className="toolbar-subtitle">
                드래그하여 이동 • 연결하여 관계 설정
              </span>
            </div>
            <div className="toolbar-right">
              <button className="btn-sm-v2 btn-secondary-v2">
                💾 저장
              </button>
              <button className="btn-sm-v2 btn-secondary-v2">
                📤 내보내기
              </button>
            </div>
          </div>

          <div className="node-flow-container-v2">
            <SimpleNodeFlow />
          </div>

          {/* 빠른 가이드 (하단) */}
          <div className="quick-guide-v2">
            <button className="guide-item">
              <span className="guide-icon">➕</span>
              <span className="guide-text">노드 추가</span>
            </button>
            <button className="guide-item">
              <span className="guide-icon">🔗</span>
              <span className="guide-text">연결</span>
            </button>
            <button className="guide-item">
              <span className="guide-icon">✏️</span>
              <span className="guide-text">편집</span>
            </button>
            <button className="guide-item">
              <span className="guide-icon">🗑️</span>
              <span className="guide-text">삭제</span>
            </button>
            <button className="guide-item">
              <span className="guide-icon">🔍</span>
              <span className="guide-text">확대/축소</span>
            </button>
          </div>
        </main>

            {/* 우측 패널 - 노드 상세/통계 */}
            <aside className="workflow-rightbar-v2">
              <div className="rightbar-section">
                <h3 className="section-title-small">📊 통계</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">3</div>
                    <div className="stat-label">이슈 노드</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">2</div>
                    <div className="stat-label">해결방안</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">2</div>
                    <div className="stat-label">연결</div>
                  </div>
                  <div className="stat-card positive">
                    <div className="stat-value">1.3억</div>
                    <div className="stat-label">총 절세</div>
                  </div>
                </div>
              </div>

              <div className="rightbar-section">
                <h3 className="section-title-small">⚡ 빠른 작업</h3>
                <div className="quick-actions">
                  <button className="quick-action-btn">
                    <span className="action-icon">🎯</span>
                    <span className="action-text">자동 정렬</span>
                  </button>
                  <button className="quick-action-btn">
                    <span className="action-icon">🔄</span>
                    <span className="action-text">실행 순서 계산</span>
                  </button>
                  <button className="quick-action-btn">
                    <span className="action-icon">✅</span>
                    <span className="action-text">순환 검사</span>
                  </button>
                  <button className="quick-action-btn">
                    <span className="action-icon">📊</span>
                    <span className="action-text">영향 분석</span>
                  </button>
                </div>
              </div>
            </aside>
          </>
        )}

        {/* Step 2: 대화형 정보 수집 */}
        {workflowStep === 'conversation' && (
          <div className="conversation-step-wrapper">
            <div className="step-header">
              <h2>📋 상세 정보 수집</h2>
              <p>정확한 전략 수립을 위해 추가 정보를 입력해주세요</p>
            </div>
            <ConversationFlow
              onComplete={handleConversationComplete}
              initialAnswers={{ caseDescription }}
            />
          </div>
        )}

        {/* Step 3: AI 분석 중 */}
        {workflowStep === 'analysis' && (
          <div className="analysis-step-wrapper">
            <div className="analysis-loading">
              <div className="analysis-spinner"></div>
              <h2>🤖 AI가 전략을 분석하고 있습니다...</h2>
              <p>수집된 정보를 바탕으로 최적의 세무 전략을 생성 중입니다</p>
              <div className="analysis-progress">
                <div className="analysis-step active">
                  ✓ 정보 수집 완료
                </div>
                <div className="analysis-step active">
                  🔄 시나리오 생성 중
                </div>
                <div className="analysis-step">
                  ⏳ 세금 계산 대기 중
                </div>
                <div className="analysis-step">
                  ⏳ 전략 비교 대기 중
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: 노드 기반 전략 표시 */}
        {workflowStep === 'nodes' && (
          <>
            {/* 좌측 - 수집된 정보 요약 */}
            <aside className="workflow-sidebar-v2">
              <div className="sidebar-section">
                <div className="section-header">
                  <h2>📋 수집된 정보</h2>
                  <button
                    className="btn-edit-info"
                    onClick={() => setWorkflowStep('conversation')}
                  >
                    ✏️ 수정
                  </button>
                </div>
                {collectedInfo && (
                  <div className="collected-info-summary">
                    <pre className="info-text">
                      {collectedInfo.formattedText.substring(0, 500)}...
                    </pre>
                    <div className="info-completeness">
                      완성도: {collectedInfo.completeness.toFixed(0)}%
                    </div>
                  </div>
                )}
              </div>

              <div className="sidebar-section">
                <h3 className="section-title-small">🎯 전략 개요</h3>
                <div className="strategy-summary">
                  <div className="summary-item">
                    <span className="summary-label">추천 전략:</span>
                    <span className="summary-value">부담부 증여</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">예상 절세:</span>
                    <span className="summary-value highlight">1.3억원</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">실행 단계:</span>
                    <span className="summary-value">5단계</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* 중앙 - 시각화 영역 */}
            <main className="workflow-main-v2">
              <div className="workflow-toolbar-v2">
                <div className="toolbar-left">
                  <span className="toolbar-title">
                    {activeVisualization === 'nodes' && '전략 노드 그래프'}
                    {activeVisualization === 'comparison' && '시나리오 비교 분석'}
                    {activeVisualization === 'tree' && '의사결정 트리'}
                    {activeVisualization === 'plan' && '실행 계획서'}
                    {activeVisualization === 'simulator' && '세금 시뮬레이터'}
                  </span>
                  <span className="toolbar-subtitle">
                    {activeVisualization === 'nodes' && 'AI가 생성한 최적 전략'}
                    {activeVisualization === 'comparison' && '전략별 세금 및 복잡도 비교'}
                    {activeVisualization === 'tree' && '시각적 전략 선택 가이드'}
                    {activeVisualization === 'plan' && '단계별 실행 로드맵'}
                    {activeVisualization === 'simulator' && '실시간 세금 계산 및 최적화'}
                  </span>
                </div>
                <div className="toolbar-right">
                  <button className="btn-sm-v2 btn-secondary-v2">
                    💾 저장
                  </button>
                  <button className="btn-sm-v2 btn-secondary-v2">
                    📤 PDF 내보내기
                  </button>
                </div>
              </div>

              <div className="visualization-container-v2">
                {activeVisualization === 'nodes' && (
                  <div className="node-flow-container-v2">
                    <SimpleNodeFlow />
                  </div>
                )}

                {activeVisualization === 'comparison' && collectedInfo?.strategy?.scenarios && (
                  <StrategyComparison
                    scenarios={collectedInfo.strategy.scenarios}
                    recommendedScenario={collectedInfo.strategy.recommendedScenario}
                  />
                )}

                {activeVisualization === 'tree' && collectedInfo?.strategy && (
                  <DecisionTree
                    scenarios={collectedInfo.strategy.scenarios}
                    actionPlan={collectedInfo.strategy.actionPlan}
                    reasoning={collectedInfo.strategy.reasoning}
                  />
                )}

                {activeVisualization === 'plan' && collectedInfo?.strategy?.actionPlan && (
                  <ActionPlan
                    actionPlan={collectedInfo.strategy.actionPlan}
                    recommendedScenario={collectedInfo.strategy.recommendedScenario}
                  />
                )}

                {activeVisualization === 'simulator' && collectedInfo && (
                  <TaxSimulator collectedInfo={collectedInfo} />
                )}
              </div>
            </main>

            {/* 우측 - 통계 및 액션 */}
            <aside className="workflow-rightbar-v2">
              <div className="rightbar-section">
                <h3 className="section-title-small">📊 전략 성과</h3>
                <div className="stats-grid">
                  <div className="stat-card positive">
                    <div className="stat-value">1.3억</div>
                    <div className="stat-label">총 절세액</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">65%</div>
                    <div className="stat-label">절세율</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">5</div>
                    <div className="stat-label">실행 단계</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">30일</div>
                    <div className="stat-label">예상 기간</div>
                  </div>
                </div>
              </div>

              <div className="rightbar-section">
                <h3 className="section-title-small">⚡ 시각화 선택</h3>
                <div className="quick-actions">
                  <button
                    className={`quick-action-btn ${activeVisualization === 'nodes' ? 'active' : ''}`}
                    onClick={() => setActiveVisualization('nodes')}
                  >
                    <span className="action-icon">🎯</span>
                    <span className="action-text">노드 그래프</span>
                  </button>
                  <button
                    className={`quick-action-btn ${activeVisualization === 'comparison' ? 'active' : ''}`}
                    onClick={() => setActiveVisualization('comparison')}
                  >
                    <span className="action-icon">📊</span>
                    <span className="action-text">시나리오 비교표</span>
                  </button>
                  <button
                    className={`quick-action-btn ${activeVisualization === 'tree' ? 'active' : ''}`}
                    onClick={() => setActiveVisualization('tree')}
                  >
                    <span className="action-icon">🌳</span>
                    <span className="action-text">의사결정 트리</span>
                  </button>
                  <button
                    className={`quick-action-btn ${activeVisualization === 'plan' ? 'active' : ''}`}
                    onClick={() => setActiveVisualization('plan')}
                  >
                    <span className="action-icon">📋</span>
                    <span className="action-text">실행 계획서</span>
                  </button>
                  <button
                    className={`quick-action-btn ${activeVisualization === 'simulator' ? 'active' : ''}`}
                    onClick={() => setActiveVisualization('simulator')}
                  >
                    <span className="action-icon">💰</span>
                    <span className="action-text">세금 시뮬레이션</span>
                  </button>
                </div>
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}

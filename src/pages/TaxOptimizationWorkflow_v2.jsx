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
import './TaxOptimizationWorkflow_v2.css';

export default function TaxOptimizationWorkflow() {
  const [caseDescription, setCaseDescription] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!caseDescription.trim()) {
      alert('케이스 설명을 입력해주세요');
      return;
    }

    setIsAnalyzing(true);
    // TODO: AI 분석 로직
    setTimeout(() => {
      setIsAnalyzing(false);
      alert('AI 분석 완료! 노드가 자동으로 생성되었습니다.');
    }, 2000);
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

        {/* 우측 패널 - 노드 상세/통계 (옵션) */}
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
      </div>
    </div>
  );
}

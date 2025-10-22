/**
 * Home Page - AI Tax Consultant
 * Google Chrome Style Search-Centered UI
 * @version 2.0.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // Navigate to workflow with query
      navigate('/node-workflow', { state: { initialQuery: query } });
    }
  };

  const quickActions = [
    {
      id: 'inheritance',
      icon: '🏛️',
      title: '상속세',
      description: '상속 재산에 대한 세금 계산',
      disabled: true,
      path: '/inheritance-tax'
    },
    {
      id: 'gift',
      icon: '🎁',
      title: '증여세',
      description: '증여 재산에 대한 세금 계산',
      disabled: true,
      path: '/gift-tax'
    },
    {
      id: 'capital-gains',
      icon: '🏠',
      title: '양도소득세',
      description: '부동산 양도소득세 계산',
      disabled: false,
      path: '/capital-gains'
    }
  ];

  return (
    <div className="home-page">
      {/* Settings Icon */}
      <div className="settings-container">
        <button
          className="settings-icon"
          onClick={() => navigate('/settings')}
          title="설정"
        >
          ⚙️
        </button>
      </div>

      {/* Main Content - Chrome Style */}
      <main className="chrome-style-main">
        <div className="chrome-container">
          {/* Logo & Title */}
          <div className="logo-section">
            <div className="app-logo">🤖</div>
            <h1 className="app-title">AI Tax Consultant</h1>
            <p className="app-tagline">AI 기반 세무 상담 및 최적화 서비스</p>
          </div>

          {/* Search Bar - Chrome Style */}
          <form className="search-section" onSubmit={handleSearch}>
            <div className="search-bar">
              <div className="search-icon">🔍</div>
              <input
                type="text"
                className="search-input"
                placeholder="세무 상담 내용을 입력하세요... (예: 부동산 양도소득세 절세 방법)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  className="clear-button"
                  onClick={() => setQuery('')}
                >
                  ✕
                </button>
              )}
            </div>
            <div className="search-buttons">
              <button type="submit" className="search-submit-btn">
                AI 상담 시작
              </button>
              <button
                type="button"
                className="search-lucky-btn"
                onClick={() => navigate('/node-workflow')}
              >
                워크플로우로 이동
              </button>
            </div>
          </form>

          {/* Quick Access - Tax Calculators */}
          <div className="quick-access-section">
            <p className="quick-access-label">세금 계산기 바로가기</p>
            <div className="quick-access-grid">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  className={`quick-access-item ${action.disabled ? 'disabled' : ''}`}
                  onClick={() => !action.disabled && navigate(action.path)}
                  disabled={action.disabled}
                  title={action.description}
                >
                  <div className="quick-icon">{action.icon}</div>
                  <div className="quick-title">{action.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="chrome-footer">
        <div className="footer-content">
          <div className="footer-links">
            <button className="footer-link">도움말</button>
            <button className="footer-link">개인정보처리방침</button>
            <button className="footer-link">약관</button>
          </div>
          <div className="footer-disclaimer">
            ⚠️ 본 서비스의 계산 결과는 참고용이며, 정확한 세액은 세무사 또는 관할 세무서에 문의하시기 바랍니다.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

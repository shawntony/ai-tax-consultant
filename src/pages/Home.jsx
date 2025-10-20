/**
 * Home Page - MVP Landing Page
 *
 * AI Tax Consultant 메인 페이지
 *
 * @component Home
 * @version 1.0.0
 * @date 2024-10-18
 */

import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      {/* 헤더 */}
      <header className="app-header">
        <div className="container">
          <h1 className="app-title">AI Tax Consultant</h1>
          <p className="app-subtitle">AI 기반 세금 계산 및 분석 서비스</p>
          <nav className="app-nav">
            <Link to="/settings" className="nav-link">
              ⚙️ 설정
            </Link>
          </nav>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="main-content">
        <div className="container">
          <section className="hero-section">
            <h2 className="hero-title">세금 계산을 더 쉽게</h2>
            <p className="hero-description">
              복잡한 세금 계산을 AI의 도움으로 간편하게 처리하세요
            </p>
          </section>

          {/* 세금 타입 카드 */}
          <section className="tax-types">
            <h3 className="section-title">세금 계산 서비스</h3>

            <div className="cards-grid">
              {/* 상속세 카드 */}
              <div className="tax-card">
                <div className="card-icon">🏛️</div>
                <h4 className="card-title">상속세</h4>
                <p className="card-description">
                  상속 재산에 대한 세금 계산
                </p>
                <button className="card-button" disabled>
                  곧 출시
                </button>
              </div>

              {/* 증여세 카드 */}
              <div className="tax-card">
                <div className="card-icon">🎁</div>
                <h4 className="card-title">증여세</h4>
                <p className="card-description">
                  증여 재산에 대한 세금 계산
                </p>
                <button className="card-button" disabled>
                  곧 출시
                </button>
              </div>

              {/* 양도소득세 카드 */}
              <div className="tax-card active">
                <div className="card-icon">🏠</div>
                <h4 className="card-title">양도소득세</h4>
                <p className="card-description">
                  부동산 양도소득세 계산
                </p>
                <Link to="/capital-gains" className="card-button primary">
                  계산 시작
                </Link>
              </div>
            </div>
          </section>

          {/* 주요 기능 */}
          <section className="features">
            <h3 className="section-title">주요 기능</h3>

            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">🤖</div>
                <h4 className="feature-title">AI 분석</h4>
                <p className="feature-description">
                  Claude, ChatGPT, Perplexity를 활용한 세금 분석
                </p>
              </div>

              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <h4 className="feature-title">실시간 계산</h4>
                <p className="feature-description">
                  입력과 동시에 세금 계산 결과 확인
                </p>
              </div>

              <div className="feature-item">
                <div className="feature-icon">🔐</div>
                <h4 className="feature-title">안전한 저장</h4>
                <p className="feature-description">
                  AES-256 암호화로 API 키 안전 보관
                </p>
              </div>

              <div className="feature-item">
                <div className="feature-icon">📄</div>
                <h4 className="feature-title">PDF 리포트</h4>
                <p className="feature-description">
                  계산 결과를 PDF로 다운로드
                </p>
              </div>
            </div>
          </section>

          {/* 시작하기 */}
          <section className="cta-section">
            <h3 className="cta-title">지금 바로 시작하세요</h3>
            <p className="cta-description">
              API 키를 설정하고 세금 계산을 시작하세요
            </p>
            <div className="cta-buttons">
              <Link to="/settings" className="cta-button secondary">
                API 키 설정
              </Link>
              <Link to="/capital-gains" className="cta-button primary">
                양도소득세 계산
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="app-footer">
        <div className="container">
          <p className="footer-text">
            © 2024 AI Tax Consultant. All rights reserved.
          </p>
          <p className="footer-disclaimer">
            ⚠️ 본 서비스의 계산 결과는 참고용이며, 실제 세액과 다를 수 있습니다.
            정확한 세액은 세무사 또는 관할 세무서에 문의하시기 바랍니다.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

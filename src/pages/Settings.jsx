/**
 * Settings Page - API Key Management
 *
 * AI Tax Consultant 설정 페이지
 *
 * @component Settings
 * @version 1.0.0
 * @date 2024-10-18
 */

import React from 'react';
import { Link } from 'react-router-dom';
import APIKeyForm from '../components/APIKeyForm';
import './Settings.css';

const Settings = () => {
  return (
    <div className="settings-page">
      {/* 헤더 */}
      <header className="settings-header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="back-link">
              ← 홈으로
            </Link>
            <h1 className="page-title">설정</h1>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="settings-content">
        <div className="container">
          {/* API 키 관리 섹션 */}
          <section className="settings-section">
            <APIKeyForm />
          </section>

          {/* 추가 설정 섹션 (향후 확장용) */}
          <section className="settings-section">
            <div className="section-header">
              <h2>기타 설정</h2>
              <p className="section-description">
                추가 설정 옵션은 곧 추가될 예정입니다
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="settings-footer">
        <div className="container">
          <p className="footer-text">
            © 2024 AI Tax Consultant. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Settings;
